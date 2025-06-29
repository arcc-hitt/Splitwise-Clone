import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import CreateGroup from './components/CreateGroup';
import AddExpense from './components/AddExpense';
import GroupBalances from './components/GroupBalances';
import UserBalances from './components/UserBalances';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell/>}>
          <Route index element={<CreateGroup />} />
          <Route path="add-expense" element={<AddExpense />} />
          <Route path="group-balances" element={<GroupBalances />} />
          <Route path="user-balances" element={<UserBalances />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
