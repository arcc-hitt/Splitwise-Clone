import { Link, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white">
        <nav className="container mx-auto p-4 flex flex-wrap space-x-4">
          <Link to="/" className="hover:underline">Create Group</Link>
          <Link to="/add-expense" className="hover:underline">Add Expense</Link>
          <Link to="/group-balances" className="hover:underline">Group Balances</Link>
          <Link to="/user-balances" className="hover:underline">My Balances</Link>
          <Link to="/chat" className="hover:underline">Chatbot</Link>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet/>
      </main>
      <footer className="bg-gray-100 text-center p-2 text-sm">
        Splitwise Clone
      </footer>
    </div>
  );
}
