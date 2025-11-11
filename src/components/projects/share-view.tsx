import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project } from "@/lib/project-data"
import {
  Share2,
  Link2,
  Mail,
  Copy,
  Check,
  Globe,
  Lock,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  QrCode,
} from "lucide-react"

interface ShareViewProps {
  project: Project
}

interface SharedUser {
  id: string
  name: string
  email: string
  role: string
  permission: "view" | "edit" | "admin"
  addedDate: string
}

export function ShareView({ project }: ShareViewProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [invitePermission, setInvitePermission] = useState<"view" | "edit" | "admin">("view")
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])

  const shareableLink = `https://zenith.app/projects/${project.id}/share`

  const copyToClipboard = (text: string, type: "link" | "email") => {
    navigator.clipboard.writeText(text)
    if (type === "link") {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } else {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    }
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    
    const newUser: SharedUser = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Invited",
      permission: invitePermission,
      addedDate: new Date().toISOString().split("T")[0],
    }
    
    setSharedUsers([...sharedUsers, newUser])
    setInviteEmail("")
    setInvitePermission("view")
  }

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter(u => u.id !== userId))
  }

  const handleChangePermission = (userId: string, permission: "view" | "edit" | "admin") => {
    setSharedUsers(sharedUsers.map(u => 
      u.id === userId ? { ...u, permission } : u
    ))
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view":
        return <Eye className="w-3 h-3" />
      case "edit":
        return <Edit className="w-3 h-3" />
      case "admin":
        return <Users className="w-3 h-3" />
      default:
        return <Eye className="w-3 h-3" />
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case "view":
        return "border-blue-500 text-blue-600 bg-blue-500/10"
      case "edit":
        return "border-yellow-500 text-yellow-600 bg-yellow-500/10"
      case "admin":
        return "border-purple-500 text-purple-600 bg-purple-500/10"
      default:
        return "border-blue-500 text-blue-600 bg-blue-500/10"
    }
  }

  return (
    <div className="space-y-6">
      {/* Public Access Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            Project Visibility
          </CardTitle>
          <CardDescription>
            Control who can access this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="public-access" className="text-base font-semibold">
                  Public Access
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this project
              </p>
            </div>
            <Switch
              id="public-access"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Shareable Link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={shareableLink}
                  readOnly
                  className="flex-1 bg-background"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareableLink, "link")}
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link is public. Anyone with access can view the project.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Share this project with specific people
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-permission">Permission Level</Label>
              <Select
                value={invitePermission}
                onValueChange={(value: "view" | "edit" | "admin") => setInvitePermission(value)}
              >
                <SelectTrigger id="invite-permission">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <div>
                        <p className="font-medium">View</p>
                        <p className="text-xs text-muted-foreground">Can view project details</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="edit">
                    <div className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Edit</p>
                        <p className="text-xs text-muted-foreground">Can edit tasks and content</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-muted-foreground">Full access and management</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleInvite} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* People with Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              People with Access
            </div>
            <Badge variant="secondary">{sharedUsers.length} members</Badge>
          </CardTitle>
          <CardDescription>
            Manage access and permissions for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sharedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No one has access yet</p>
              <p className="text-xs mt-1">Invite team members to collaborate on this project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedUsers.map((user, index) => (
                <div key={user.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Added {user.addedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.permission}
                        onValueChange={(value: "view" | "edit" | "admin") =>
                          handleChangePermission(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-2">
                            {getPermissionIcon(user.permission)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common sharing and export options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Copy className="w-4 h-4 mr-2" />
              Copy Project Link
            </Button>
            <Button variant="outline" className="justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Email Summary
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline" className="justify-start">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No views yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Team members with access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Shares</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Times link was copied
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

