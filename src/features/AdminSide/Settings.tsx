import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { Separator } from "@ui/separator";
import { Save, Mail, Bell, Lock, Shield, CreditCard } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-1 md:col-span-1">
          <div className="p-2 rounded-md hover:bg-muted/50 cursor-pointer font-medium">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4" />
              <span>Email Notifications</span>
            </div>
          </div>
          <div className="p-2 rounded-md hover:bg-muted/50 cursor-pointer font-medium">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4" />
              <span>Push Notifications</span>
            </div>
          </div>
          <div className="p-2 rounded-md hover:bg-muted/50 cursor-pointer font-medium">
            <div className="flex items-center space-x-3">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </div>
          </div>
          <div className="p-2 rounded-md hover:bg-muted/50 cursor-pointer font-medium">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </div>
          </div>
          <div className="p-2 rounded-md bg-muted/50 cursor-pointer font-medium">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </div>
          </div>
        </div>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Update your billing information and view invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="**** **** **** 4242" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Billing Address</Label>
              <Input id="address" placeholder="123 Main St, City, Country" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Receipts</h4>
                <p className="text-sm text-muted-foreground">
                  Receive email receipts for your payments
                </p>
              </div>
              <Switch id="email-receipts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-renew Subscription</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically renew your subscription
                </p>
              </div>
              <Switch id="auto-renew" defaultChecked />
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
