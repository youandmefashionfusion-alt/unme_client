import React from 'react'
import FeaturedCollection from './FeaturedCollection'
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";

const FeaturedCollectionServer = async () => {
    let collections = [];

    const fetchCollections = async () => {
        try {
            const response = await fetch(`${process.env.API_PORT}home/trending-collections`, {
                cache: "no-store",
            });
            const data = await response.json();
            if (data) {
                collections = data?.data || [];
            }
        } catch (error) {
            if (!isDynamicServerUsageError(error)) {
                console.error('Error fetching collections:', error);
            }
        }
    };

    await fetchCollections();

    return (
        <FeaturedCollection initialCollections={collections} />
    )
}

export default FeaturedCollectionServer
