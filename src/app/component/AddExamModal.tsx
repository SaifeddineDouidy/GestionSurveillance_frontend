"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from "@/components/ui/dialog"; 
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; 
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import { Checkbox } from "@/components/ui/checkbox"; 

const AddExamModal = ({ showExamModal, setShowExamModal }) => {
  const [departements, setDepartements] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [options, setOptions] = useState([]);
  const [modules, setModules] = useState([]);
  const [newSession, setNewSession] = useState({
    departement: "",
    enseignant: "",
    option: "",
    module: "",
    isManuelle: false,
    locaux: [],
  });

  // Fetch departments
  useEffect(() => {
    axios.get("http://localhost:8088/api/departements").then((response) => {
      setDepartements(response.data);
    });
  }, []);

  // Fetch enseignants based on selected departement
  useEffect(() => {
    if (newSession.departement) {
      axios.get(`http://localhost:8088/api/departements/${newSession.departement}/enseignants`).then((response) => {
        setEnseignants(response.data);
      });
    }
  }, [newSession.departement]);

  // Handle department change
  const handleDepartmentChange = (value: any) => {
    setNewSession({ ...newSession, departement: value, enseignant: "", option: "", module: "" });
  };

  // Handle option change (you can adjust this based on your specific logic)
  const handleOptionChange = (value: any) => {
    setNewSession({ ...newSession, option: value, module: "" });
    // Fetch modules based on the option
    if (value) {
      setModules(["Module A", "Module B", "Module C"]); // Just an example
    }
  };

  const handleAddSession = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <Dialog open={showExamModal} onOpenChange={setShowExamModal}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Examen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddSession} className="grid gap-4 py-4">
          {/* Département Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departement" className="text-right">Département</Label>
            <Select value={newSession.departement} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner le département" />
              </SelectTrigger>
              <SelectContent>
                {departements.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enseignant Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="enseignant" className="text-right">Enseignant</Label>
            <Select value={newSession.enseignant} onValueChange={(value) => setNewSession({ ...newSession, enseignant: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner l'enseignant" />
              </SelectTrigger>
              <SelectContent>
                {enseignants.map((ens) => (
                  <SelectItem key={ens.id} value={ens.id}>
                    {ens.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Option Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="option" className="text-right">Option</Label>
            <Select value={newSession.option} onValueChange={handleOptionChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner l'option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Option 1">Option 1</SelectItem>
                <SelectItem value="Option 2">Option 2</SelectItem>
                <SelectItem value="Option 3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Module Select based on Option */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="module" className="text-right">Module</Label>
            <Select value={newSession.module} onValueChange={(value) => setNewSession({ ...newSession, module: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner le module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode Radio Buttons */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isManuelle" className="text-right">Mode</Label>
            <RadioGroup value={newSession.isManuelle ? "manuelle" : "automatique"} onValueChange={(value) => setNewSession({ ...newSession, isManuelle: value === "manuelle" })}>
              <div className="flex items-center gap-4">
                <RadioGroupItem value="automatique" id="automatique" />
                <Label htmlFor="automatique">Automatique</Label>
                <RadioGroupItem value="manuelle" id="manuelle" />
                <Label htmlFor="manuelle">Manuelle</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Locaux Multi-select */}
          {newSession.isManuelle && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="locaux" className="text-right">Locaux</Label>
              <div className="col-span-3">
                <Checkbox checked={newSession.locaux.includes("Locaux 1")} onCheckedChange={(checked) => setNewSession({
                  ...newSession,
                  locaux: checked ? [...newSession.locaux, "Locaux 1"] : newSession.locaux.filter(loc => loc !== "Locaux 1"),
                })}>Locaux 1</Checkbox>
                <Checkbox checked={newSession.locaux.includes("Locaux 2")} onCheckedChange={(checked) => setNewSession({
                  ...newSession,
                  locaux: checked ? [...newSession.locaux, "Locaux 2"] : newSession.locaux.filter(loc => loc !== "Locaux 2"),
                })}>Locaux 2</Checkbox>
                <Checkbox checked={newSession.locaux.includes("Locaux 3")} onCheckedChange={(checked) => setNewSession({
                  ...newSession,
                  locaux: checked ? [...newSession.locaux, "Locaux 3"] : newSession.locaux.filter(loc => loc !== "Locaux 3"),
                })}>Locaux 3</Checkbox>
              </div>
            </div>
          )}

          {/* Dialog Footer */}
          <div className="flex justify-end space-x-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit">Enregistrer l'exam</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamModal;
