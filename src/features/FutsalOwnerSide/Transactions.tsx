import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { RefreshCw, CheckCircle, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiQuery } from "@lib/apiWrapper";

const futsalId = import.meta.env.VITE_FUTSAL_ID;

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getActionButton(status: string) {
  switch (status) {
    case "completed":
      return (
        <Button variant="outline" size="sm" disabled>
          <CheckCircle className="h-4 w-4" />
        </Button>
      );
    case "pending":
      return (
        <Button variant="default" size="sm">
          <Check className="h-4 w-4" />
        </Button>
      );
    default:
      return (
        <Button variant="outline" size="sm">
          Action
        </Button>
      );
  }
}

export default function Transactions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["futsal-transactions", futsalId],
    queryFn: () => apiQuery(`/futsals/${futsalId}/transactions`),
  });

  const summary = data?.summary || {
    totalCollected: 0,
    totalRefunded: 0,
    thisMonth: 0,
  };
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transaction Summary</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">View Details</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              Rs. {summary.totalCollected}
            </div>
            <p className="text-sm text-gray-600">Total Collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              Rs. {summary.totalRefunded}
            </div>
            <p className="text-sm text-gray-600">Total Refunded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              Rs. {summary.thisMonth}
            </div>
            <p className="text-sm text-gray-600">This Month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-8">Loading transactions...</div>
            )}
            {error && (
              <div className="text-center text-red-500 py-8">
                Error loading transactions.
              </div>
            )}
            {!isLoading && !error && (
              <>
                <div className="text-xs text-gray-500 mb-4">
                  Showing {transactions.length} transaction
                  {transactions.length !== 1 ? "s" : ""}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">S.N</th>
                        <th className="text-left py-3 px-4">Transaction ID</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Booked By</th>
                        <th className="text-left py-3 px-4">Date/Time</th>
                        <th className="text-left py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr
                          key={
                            transaction.transactionId || transaction.id || index
                          }
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {transaction.sn || index + 1}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {transaction.transactionId || transaction.id}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            Rs. {transaction.amount}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="py-3 px-4">{transaction.bookedBy}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div>
                                {transaction.date
                                  ? new Date(
                                      transaction.date,
                                    ).toLocaleDateString()
                                  : ""}
                              </div>
                              <div className="text-gray-500">
                                {transaction.startTime} - {transaction.endTime}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getActionButton(transaction.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
