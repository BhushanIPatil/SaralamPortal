import { useParams } from 'react-router-dom'

export function CategoryPage() {
  const { slug } = useParams()
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="section-title">Category: {slug}</h1>
    </div>
  )
}
