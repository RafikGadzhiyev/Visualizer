import { Link } from "react-router";

function App() {
  return (
    <div>
      <ul>
        <li>
          <Link to='/visualize/search'>
            Search
          </Link>
        </li>

        <li>
          <Link to='/visualize/path-finding'>
            Path finding
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default App;