import { useParams } from 'react-router-dom'


export default function SiteDetail(){
    const { id } = useParams()
    return <div>Site {id}</div>
}