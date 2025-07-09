import { Link } from "react-router";

function App() {
  return (
    <div className="h-screen flex flex-col gap-4 items-center justify-center">
      <div>
        <h1 className="text-xl font-bold">Visualizer</h1>
      </div>

      <ul>
        <li className="mb-2">
          <Link
            to='/visualize/search'
            className="w-full rounded-md p-2 py-1 bg-primary text-black"
          >
            Search
          </Link>
        </li>

        <li>
          <Link
            to='/visualize/path-finding'
            className="rounded-md p-2 py-1 bg-primary text-black"
          >
            Path finding
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default App;