import sendEmail from "../../../../../controller/emailController";
import ProductModel from "../../../../../models/productModel";
import OrderModel from "../../../../../models/orderModel";
import UserModel from "../../../../../models/userModel";
import connectDb from "../../../../../config/connectDb";
import { orderConfirmationEmail, orderDispatchedEmail } from "../../../../../controller/emailTemplates";

export const config = {
    maxDuration: 10,
};

const processOrder = async (orderItems) => {
    try {
        for (const orderItem of orderItems) {
            const { product, quantity } = orderItem;
            const productId = product;

            const foundProduct = await ProductModel.findById(productId);

            if (foundProduct.quantity >= quantity) {
                foundProduct.quantity -= quantity;
                foundProduct.sold += quantity;
                await foundProduct.save();
            } else {
                throw new Error(`Not enough quantity available`);
            }
        }
        console.log("Inventory updated successfully");
    } catch (error) {
        console.error("Error updating inventory:", error.message);
    }
};

// Function to send email after 3 hours using the new "Order Dispatched" template
const msgAfter3hour = async (firstname, ordernumber, email, orderItems, finalAmount) => {
    // Generate order items string for the email
    const orderItemsString = orderItems?.map((item) => {
        return `• ${item.product.title} - ₹${item.product.price} x ${item.quantity}`;
    }).join('<br>');

    await sendEmail({
        to: email,
        subject: "Your Order is on the Way! - U n Me Jewelry",
        text: `Your order #${ordernumber} has been dispatched and is on its way to you.`,
        htmlContent: orderDispatchedEmail({
            orderNumber: order.orderNumber,
            firstname: shippingInfo.firstname,
            email: shippingInfo.email,
            orderItems: populatedOrder.orderItems,
            finalAmount: order.finalAmount
        })
    });
};

const validateOrderPricesAndAmounts = async (orderItems, totalPrice, finalAmount, discount, shippingCost) => {
    try {
        let calculatedTotalPrice = 0;

        for (const orderItem of orderItems) {
            const { product, quantity } = orderItem;
            const productId = product;

            const foundProduct = await ProductModel.findById(productId);

            if (!foundProduct) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            calculatedTotalPrice += foundProduct.price * quantity;

            if (foundProduct.quantity < quantity) {
                throw new Error(`Not enough quantity available`);
            }
        }

        if (calculatedTotalPrice !== totalPrice) {
            throw new Error(
                `Total price mismatch. Expected: ₹${calculatedTotalPrice}, Received: ₹${totalPrice}`
            );
        }

        const expectedFinalAmount = calculatedTotalPrice - discount + shippingCost;

        if (expectedFinalAmount !== finalAmount) {
            throw new Error(
                `Final amount mismatch. Expected: ₹${expectedFinalAmount}, Received: ₹${finalAmount}`
            );
        }

        console.log("All prices and amounts validated successfully");
    } catch (error) {
        throw new Error(error.message);
    }
};

export async function POST(req, res) {
    const body = await req.text();
    const parsedBody = JSON.parse(body);

    const { shippingInfo, orderItems, totalPrice, finalAmount, shippingCost, orderType, discount, paymentInfo, tag, isPartial } = parsedBody;

    try {
        await connectDb()

        // await validateOrderPricesAndAmounts(orderItems, totalPrice, finalAmount, discount, shippingCost);

        for (const orderItem of orderItems) {
            const { product, quantity } = orderItem;
            const productId = product;

            const foundProduct = await ProductModel.findById(productId);

            if (!foundProduct) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            if (foundProduct.quantity < quantity) {
                throw new Error(`Not enough quantity available`);
            }
        }

        // Create the order
        const order = await OrderModel.create({
            shippingInfo,
            orderItems,
            totalPrice,
            finalAmount,
            shippingCost,
            orderType,
            discount,
            paymentInfo,
            tag,
            isPartial
        });

        const order1 = await OrderModel.findById(order._id).populate("orderItems.product")

        // Generate order items string for confirmation email
        const orderItemsString = order1?.orderItems.map((item) => {
            return `• ${item.product.title} - ₹${item.product.price} x ${item.quantity}`;
        }).join('<br>');
        await fetch('https://watuska-production.up.railway.app/api/template/api-send/1398372561527099', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer wsk_live_a85bb2fc43ff3285ab17dea902052cfd5ae3de0d75a4e6bd848f1f8d23cd253d',
            },
            body: JSON.stringify({
                to: `+91${order1?.shippingInfo?.phone}`,
                templateName: 'order_confirmation_client1',
                language: 'en_US',
                variables: {
                    "1": order1?.shippingInfo?.firstname, // {{1}}
                    "2": order1?.orderNumber, // {{2}}
                    "3": orderItemsString, // {{3}}
                    "4": `${order1?.finalAmount}`, // {{4}}
                },
                name: order1?.shippingInfo?.firstname,       // optional — used to create contact
            }),
        });
        await fetch('https://watuska-production.up.railway.app/api/template/api-send/1252741026187542', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer wsk_live_53fa572dfb8b86f7b5da5bd9c41d52ba659daf4959cfa176a806e7c132b170c3',
            },
            body: JSON.stringify({
                to: "+916396230428",
                templateName: 'new_order_admin',
                language: 'en_US',
                variables: {
                    "1": order1?.orderNumber, // {{1}}
                    "2": order1?.shippingInfo?.firstname, // {{2}}
                    "3": order1?.shippingInfo?.phone, // {{3}}
                    "4": orderItemsString, // {{4}}
                    "5": `${order1?.finalAmount}`, // {{5}}
                    "6": order1?.orderType, // {{6}}
                },
                name: 'UnMe Orders',       // optional — used to create contact
            }),
        });
        await fetch('https://watuska-production.up.railway.app/api/template/api-send/1252741026187542', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer wsk_live_53fa572dfb8b86f7b5da5bd9c41d52ba659daf4959cfa176a806e7c132b170c3',
            },
            body: JSON.stringify({
                to: "+917807178263",
                templateName: 'new_order_admin',
                language: 'en_US',
                variables: {
                    "1": order1?.orderNumber, // {{1}}
                    "2": order1?.shippingInfo?.firstname, // {{2}}
                    "3": order1?.shippingInfo?.phone, // {{3}}
                    "4": orderItemsString, // {{4}}
                    "5": `${order1?.finalAmount}`, // {{5}}
                    "6": order1?.orderType, // {{6}}
                },
                name: 'Divya Mam',       // optional — used to create contact
            }),
        });

        // Send confirmation email using the new template
        await sendEmail({
            to: `${shippingInfo.email}`,
            subject: "Order Confirmed! - U n Me Jewelry",
            text: `Your order #${order.orderNumber} has been confirmed. Thank you for your purchase!`,
            htmlContent: orderConfirmationEmail({
                orderNumber: order.orderNumber,
                shippingInfo,
                orderItems: order1.orderItems,
                totalPrice,
                finalAmount,
                shippingCost,
                discount
            })
        });

        const { firstname, lastname, email, phone, address } = shippingInfo;

        // Check if the user already exists
        let user = await UserModel.findOne({ email });

        // If the user doesn't exist, create a new user
        if (!user) {
            user = await UserModel.create({
                email,
                firstname,
                lastname,
                mobile: phone,
                address
            });
        }

        // Update the inventory
        await processOrder(orderItems);

        // Schedule a message after 3 hours with order details
        setTimeout(async () => {
            const populatedOrder = await OrderModel.findById(order._id).populate("orderItems.product");
            await msgAfter3hour(
                shippingInfo.firstname,
                order.orderNumber,
                shippingInfo.email,
                populatedOrder.orderItems,
                order.finalAmount
            );
        }, 10800000); // 3 hours in milliseconds

        return Response.json(
            { success: true, status: "Order Created", amount: order.finalAmount, firstname: order.shippingInfo.firstname, orderNumber: order.orderNumber },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error Creating Order:", error.message);
        return Response.json(
            { success: false, error: "Failed to create order" },
            { status: 500 }
        );
    }
};



