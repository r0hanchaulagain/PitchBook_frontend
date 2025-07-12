import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import {
  Download,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";

// Mock data - Will be replaced with API calls
const mockTransactions = [
  {
    id: 1,
    date: "2025-07-03",
    user: "John Doe",
    amount: 2500,
    status: "completed",
    type: "booking",
  },
  {
    id: 2,
    date: "2025-07-02",
    user: "Jane Smith",
    amount: 3500,
    status: "pending",
    type: "subscription",
  },
  {
    id: 3,
    date: "2025-07-01",
    user: "Mike Johnson",
    amount: 4500,
    status: "completed",
    type: "booking",
  },
  {
    id: 4,
    date: "2025-06-30",
    user: "Sarah Williams",
    amount: 3000,
    status: "failed",
    type: "booking",
  },
  {
    id: 5,
    date: "2025-06-29",
    user: "David Brown",
    amount: 2000,
    status: "completed",
    type: "subscription",
  },
];

const Transactions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Filter by Date
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 h-9 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-right p-3">Amount</th>
                  <th className="text-right p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">#{tx.id}</td>
                    <td className="p-3">{tx.date}</td>
                    <td className="p-3">{tx.user}</td>
                    <td className="p-3 capitalize">{tx.type}</td>
                    <td className="p-3 text-right">
                      Rs. {tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : tx.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>Showing 1 to 5 of {mockTransactions.length} entries</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
