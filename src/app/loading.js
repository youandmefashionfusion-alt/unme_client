import Image from "next/image";
import loading from '../../images/loading.gif'
export default function Loading() {
    return <div className='loading'>
        <Image src={loading} priority width={50} height={50} alt='loading-image' title='loading-image' />
        <p>Loading....</p>
    </div>
}