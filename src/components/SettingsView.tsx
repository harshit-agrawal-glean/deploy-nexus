import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

export function SettingsView() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-slate-900">Settings</h2>
        <p className="text-slate-600 mt-1">
          Configure system-wide settings and integrations
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">General Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-slate-600">
                  Receive email notifications for deployment events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-deploy on Success</Label>
                <p className="text-sm text-slate-600">
                  Automatically deploy to next environment after successful deployment
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval for Production</Label>
                <p className="text-sm text-slate-600">
                  Production deployments must be approved by admin or QA
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Integrations</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="slack">Slack Webhook URL</Label>
              <Input
                id="slack"
                placeholder="https://hooks.slack.com/services/..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="jira">Jira API Key</Label>
              <Input
                id="jira"
                type="password"
                placeholder="Enter your Jira API key"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub Token</Label>
              <Input
                id="github"
                type="password"
                placeholder="ghp_..."
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Deployment Defaults</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeout">Deployment Timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                defaultValue={30}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="retries">Max Retry Attempts</Label>
              <Input
                id="retries"
                type="number"
                defaultValue={3}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="concurrent">Max Concurrent Deployments</Label>
              <Input
                id="concurrent"
                type="number"
                defaultValue={5}
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
