import { Header } from "@/components/Header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut, AlertTriangle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from "sonner";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

const PersonalSecurity = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: any = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
    try {
      await api.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('current password')) {
        newErrors = { ...newErrors, currentPassword: errorMessage };
      }
      setPasswordErrors(newErrors);
    }
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Password is required");
      setDeleting(false);
      return;
    }
    try {
      await api.delete('/users/delete-account', { data: { password: deletePassword } });
      toast.success('Account deleted successfully!');
      logout();
      navigate('/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to delete account.';
      if (errorMsg.toLowerCase().includes('incorrect password')) {
        setDeleteError('Incorrect password. Please try again.');
      } else {
        setDeleteError(errorMsg);
      }
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card shadow-xl border-0 rounded-2xl">
            <CardContent className="p-6 space-y-7">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="h-7 w-7 text-teal-600" />
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{t('password')}</h3>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4 bg-background rounded-xl p-3 shadow-sm">
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                    <Input id="currentPassword" name="currentPassword" type={showPassword.current ? "text" : "password"} value={passwordForm.currentPassword} onChange={handlePasswordInputChange} error={passwordErrors.currentPassword} className="bg-background text-foreground" />
                    <button type="button" className="absolute right-3 top-8 text-muted-foreground" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))} tabIndex={-1}>
                      {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <Input id="newPassword" name="newPassword" type={showPassword.new ? "text" : "password"} value={passwordForm.newPassword} onChange={handlePasswordInputChange} error={passwordErrors.newPassword} className="bg-background text-foreground" />
                    <button type="button" className="absolute right-3 top-8 text-muted-foreground" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))} tabIndex={-1}>
                      {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                    <Input id="confirmPassword" name="confirmPassword" type={showPassword.confirm ? "text" : "password"} value={passwordForm.confirmPassword} onChange={handlePasswordInputChange} error={passwordErrors.confirmPassword} className="bg-background text-foreground" />
                    <button type="button" className="absolute right-3 top-8 text-muted-foreground" onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))} tabIndex={-1}>
                      {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600">{t('updatePassword')}</Button>
                </form>
              </div>
              <div className="pt-4 border-t space-y-3">
                <Button variant="destructive" className="w-full text-base font-semibold py-3 shadow" onClick={handleLogoutClick}>
                  <LogOut className="mr-2 h-5 w-5" />
                  {t('logout')}
                </Button>
                <Button variant="outline" className="w-full border-2 border-destructive text-destructive hover:bg-destructive/10 mt-2 flex items-center justify-center gap-2 font-semibold py-3 shadow" onClick={() => setShowDeleteDialog(true)}>
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-red-100 to-red-50 px-5 py-3">
              <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" /> Delete Account
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center text-center gap-2 px-5 py-5">
              <AlertTriangle className="h-10 w-10 text-destructive mb-2 animate-bounce" />
              <p className="text-destructive font-semibold">Are you sure you want to delete your account? This action cannot be undone.</p>
              <Input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                className="mt-2 max-w-xs mx-auto bg-background text-foreground"
                error={deleteError}
              />
            </div>
            <DialogFooter className="flex flex-row gap-2 justify-end px-5 pb-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting} className="font-semibold">Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting} className="font-semibold">
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default PersonalSecurity; 