import React from 'react'
import Header from './Header';
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";

const HeaderWrapper = async () => {
    let collections = [];
    const fetchCollections = async () => {
        try {
            const response = await fetch(`${process.env.API_PORT}header-menu`, {
                cache: "no-store",
            });
            const data = await response.json();
            if (data) {
                collections = data.data || [];
            }
        } catch (error) {
            if (!isDynamicServerUsageError(error)) {
                console.error('Error fetching collections:', error);
            }
        }
    };

    await fetchCollections();
    return (
        <Header collections={collections} />
    )
}

export default HeaderWrapper
