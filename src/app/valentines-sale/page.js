'use client'
import React, { useEffect, useState } from 'react'
import styles from './sale.module.css'
import ProductCard from '../../../components/ui/productCard/ProductCard';
import Image from 'next/image';
const page = () => {
    const [data, setData] = useState([]);
    const [data1499, setData1499] = useState([]);
    const [btn, setBtn] = useState('999');
    const fetchData = async () => {
        try {
            const res1 = await fetch(`/api/products/sale-products`, {
                cache: "no-store",
            });
            const json1 = await res1.json();
            if (json1.success) {
                setData(json1.data || []);
            }
            const res = await fetch(`/api/products/sale-products1499`, {
                cache: "no-store",
            });
            const json = await res.json();
            if (json.success) {
                setData1499(json.data || []);
            }


        } catch (error) {
            console.error(`Error fetching sale products:`, error);
        }
    };

   useEffect(() => {
        fetchData();
    }, []);
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Women's Day Sale <p>Buy 3{btn === '999' ? ' \n@999' : '\n@1499'}</p></h1>
            <p className={styles.description}>Offer applied automatically at checkout</p>
            <div className={styles.productsSection}>
                <div className={styles.toggleBtn}>
                    <button className={`${styles.toggleBtnItem} ${btn === '999' ? styles.activeBtn : ''}`} onClick={() => setBtn('999')}>Sale 999</button>
                    <button className={`${styles.toggleBtnItem} ${btn === '1499' ? styles.activeBtn : ''}`} onClick={() => setBtn('1499')}>Sale 1499</button>
                </div>
                <div className={styles.productsGrid}>
                    {(btn === '999' ? data : data1499).map((product) => (
                        <div key={product._id} className={styles.productCard}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default page