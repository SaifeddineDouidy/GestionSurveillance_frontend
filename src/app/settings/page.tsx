"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen`}>
      <Navbar />
      <div className="bg-gray-50 p-12">
          <div className="bg-white rounded-lg shadow p-6">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>

        {/* Préférences de notification */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Préférences de notification</h2>
          <div className="flex items-center justify-between mb-4">
            <span>Notifications par e-mail</span>
            <Switch checked={notifications.email} onCheckedChange={() => handleNotificationChange("email")} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span>Notifications par SMS</span>
            <Switch checked={notifications.sms} onCheckedChange={() => handleNotificationChange("sms")} />
          </div>
          <div className="flex items-center justify-between">
            <span>Notifications push</span>
            <Switch checked={notifications.push} onCheckedChange={() => handleNotificationChange("push")} />
          </div>
        </section>

        {/* Paramètres du thème */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Paramètres du thème</h2>
          <div className="flex items-center justify-between">
            <span>Mode sombre</span>
            <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
          </div>
        </section>

        {/* Paramètres de langue */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Paramètres de langue</h2>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez la langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">Anglais</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Espagnol</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Paramètres du compte */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Paramètres du compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button variant="blue" className="w-full">
              Gérer les sessions
            </Button>
            <Button variant="destructive" className="w-full">
              Supprimer le compte
            </Button>
          </div>
        </section>
        </div></div>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
