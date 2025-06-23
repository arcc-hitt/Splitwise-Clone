import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CreateGroup from "./components/CreateGroup";
import AddExpense from "./components/AddExpense";
import GroupBalances from "./components/GroupBalances";
import UserBalances from "./components/UserBalances";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-blue-600 text-white p-4">
        <ul className="flex space-x-4">
          <li><Link to="/">Create Group</Link></li>
          <li><Link to="/add-expense">Add Expense</Link></li>
          <li><Link to="/group-balances">Group Balances</Link></li>
          <li><Link to="/user-balances">User Balances</Link></li>
        </ul>
      </nav>
      <div className="p-6">
        <Routes>
          <Route path="/" element={<CreateGroup />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/group-balances" element={<GroupBalances />} />
          <Route path="/user-balances" element={<UserBalances />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
