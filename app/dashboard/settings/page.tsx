'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/authContext';
import { motion } from 'framer-motion';
import { Save, Lock, Bell, Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import './settings.css';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      toast.success('Senha atualizada com sucesso!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <h1>Configurações</h1>
        <p>Gerencie sua conta e preferências</p>
      </motion.div>

      <motion.div
        className="settings-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="settings-card">
          <div className="card-header">
            <Eye className="w-5 h-5" />
            <h2>Informações da Conta</h2>
          </div>

          <div className="form-group">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled
            />
          </div>

          <div className="form-group">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(11) 99999-9999"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="btn-save"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="settings-card">
          <div className="card-header">
            <Lock className="w-5 h-5" />
            <h2>Segurança</h2>
          </div>

          <div className="form-group">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Digite a nova senha"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirme a nova senha"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isLoading}
            className="btn-save"
            variant="outline"
          >
            <Lock className="w-4 h-4" />
            Alterar Senha
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="settings-card">
          <div className="card-header">
            <Bell className="w-5 h-5" />
            <h2>Notificações</h2>
          </div>

          <div className="notification-item">
            <div>
              <p className="notification-title">Novos Pedidos</p>
              <p className="notification-desc">Receba alertas quando houver novos pedidos</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>

          <div className="notification-item">
            <div>
              <p className="notification-title">Produtos em Falta</p>
              <p className="notification-desc">Alerta quando produtos ficarem sem estoque</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>

          <div className="notification-item">
            <div>
              <p className="notification-title">Atualizações Gerais</p>
              <p className="notification-desc">Receba informações sobre novas funcionalidades</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
