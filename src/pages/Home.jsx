import Slideshow from '../components/Slideshow'
import Categories from '../components/Categories'
import FeaturedCakes from '../components/FeaturedCakes'
import usePageTitle from '../hooks/usePageTitle'

function Home() {
  usePageTitle('')
  return (
    <>
      <Slideshow />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pt-1 pb-16 sm:px-8">
        <Categories />
        <FeaturedCakes />
      </main>
    </>
  )
}

export default Home