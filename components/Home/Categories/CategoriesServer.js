import React from 'react'
import Categories from './Categories'
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";

const CategoriesServer = async () => {
    let categories = [];
    const fetchCollections = async () => {
        try {
            const response = await fetch(`${process.env.API_PORT}collection/getallcollections`, {
                cache: "no-store",
            });
            const data = await response.json();
            if (data) {
                categories = data || [];
            }
        } catch (error) {
            if (!isDynamicServerUsageError(error)) {
                console.error('Error fetching collections:', error);
            }
        }
    };

    await fetchCollections();
    return (
        <Categories collections={categories} />
    )
}

export default CategoriesServer
