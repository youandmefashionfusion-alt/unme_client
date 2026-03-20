import React from 'react'
// import CarouselSection from './CarouselSection';
import CarouselSectionDouble from './CarouselSectionDouble';
import { isDynamicServerUsageError } from "@/lib/isDynamicServerUsageError";

const CarouselSectionServer = async ({ title, type }) => {
    let data = [];
    const fetchData = async () => {
        try {
            let endpoint = '';
            switch (type) {
                case 'latest':
                    endpoint = 'home/latest-products';
                    break;
                case 'featured':
                    endpoint = 'home/featured-products';
                    break;
                case 'boss-picks':
                    endpoint = 'home/boss-picks';
                    break;
                case 'gateway-jewels':
                    endpoint = 'home/gateway-jewels';
                    break;
                default:
                    endpoint = 'home/latest-products';
            }

            const res = await fetch(`${process.env.API_PORT}${endpoint}`, {
                cache: "no-store",
            });
            const json = await res.json();
            if (json.success) {
                data = json.data || [];
            }
        } catch (error) {
            if (!isDynamicServerUsageError(error)) {
                console.error(`Error fetching ${title}:`, error);
            }
        }
    };

    await fetchData();
    return (
        <CarouselSectionDouble data={data} title={title} />
    )
}

export default CarouselSectionServer
