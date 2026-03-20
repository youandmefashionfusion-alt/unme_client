import React from 'react'
import SaleProducts from './SaleProducts';
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";

const SaleProductsServer = async ({ type }) => {
    let data = [];
    const fetchData = async () => {
        try {
            if (type === '999') {
                const res = await fetch(`${process.env.API_PORT}products/sale-products?limit=8`, {
                    cache: "no-store",
                });
                const json = await res.json();
                if (json.success) {
                    data = json.data || [];
                }
            }
             else if (type === '1499') {
                const res = await fetch(`${process.env.API_PORT}products/sale-products1299?limit=8`, {
                    cache: "no-store",
                });
                const json = await res.json();
                if (json.success) {
                    data = json.data || [];
                }
            }
            else {
                const res = await fetch(`${process.env.API_PORT}products/sale-products?limit=8`, {
                    cache: "no-store",
                });
                const json = await res.json();
                if (json.success) {
                    data = json.data || [];
                }
            }

        } catch (error) {
            if (!isDynamicServerUsageError(error)) {
                console.error(`Error fetching sale products:`, error);
            }
        }
    };

    await fetchData();
    return (
        <SaleProducts data={data} type={type}/>
    )
}

export default SaleProductsServer
