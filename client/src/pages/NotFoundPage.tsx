import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-container py-16 text-center">
      <h1 className="text-3xl font-bold text-argos-gray-800">Oops, that didn&apos;t go to plan</h1>
      <p className="mt-3 text-argos-gray-500">We can&apos;t seem to find that page right now...</p>
      <Link
        to="/"
        className="mt-6 inline-block bg-argos-red text-white font-semibold px-6 py-3 rounded hover:bg-argos-red-dark transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  )
}
