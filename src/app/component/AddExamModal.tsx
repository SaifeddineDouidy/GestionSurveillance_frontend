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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Select from "react-select";
import { format, parseISO } from "date-fns";

interface SelectedSlot {
  day: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
}

interface AddExamModalProps {
  showExamModal: boolean;
  setShowExamModal: (value: boolean) => void;
  selectedSlot?: SelectedSlot;
}

interface Module {
  id: number;
  nomModule: string;
  option: {
    id: number;
  } | null;
}

interface Local {
  id: string;
  nom: string;
  taille: number;
}

export interface Department {
  id: number;
  departmentName: string;
  options: Option[];
  enseignants: Enseignant[];
}

export interface Option {
  id: number;
  nomDeFiliere: string;
  annee: number;
  nbrInscrit: number;
  department: Department;
}

export interface Enseignant {
  id: number;
  name: string;
  department: Department;
}

interface Exam {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  department: Department;
  enseignant: Enseignant;
  option: Option;
  module: Module;
}

const AddExamModal: React.FC<AddExamModalProps> = ({
  showExamModal,
  setShowExamModal,
  selectedSlot,
}) => {
  const [departements, setDepartements] = useState<Department[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [locaux, setLocaux] = useState<Local[]>([]);
  const [newExam, setNewExam] = useState<Exam>({
    id: 0,
    date: selectedSlot?.day || "",
    startTime: selectedSlot?.timeSlot?.startTime || "",
    endTime: selectedSlot?.timeSlot?.endTime || "",
    department: { id: 0, departmentName: "", options: [], enseignants: [] },
    enseignant: { id: 0, name: "", department: { id: 0, departmentName: "", options: [], enseignants: [] } },
    option: { id: 0, nomDeFiliere: "", annee: 0, nbrInscrit: 0, department: { id: 0, departmentName: "", options: [], enseignants: [] } },
    module: { id: 0, nomModule: "", option: null },
  });

  // Fetch departments
  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const response = await axios.get("http://localhost:8088/api/departements");
        setDepartements(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartements();
  }, []);

  // Fetch locaux immediately on component mount
  useEffect(() => {
    const fetchLocaux = async () => {
      try {
        const response = await axios.get("http://localhost:8088/api/locaux");
        setLocaux(response.data);
      } catch (error) {
        console.error("Error fetching locaux:", error);
      }
    };
    fetchLocaux();
  }, []);

  // Fetch enseignants based on selected departement
  useEffect(() => {
    const fetchEnseignants = async () => {
      if (!newExam.department.id) {
        setEnseignants([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/departements/${newExam.department.id}/enseignants`
        );
        setEnseignants(response.data);
      } catch (error) {
        console.error("Error fetching enseignants:", error);
      }
    };
    fetchEnseignants();
  }, [newExam.department.id]);

  // Fetch options based on the selected departement
  useEffect(() => {
    const fetchOptions = async () => {
      if (!newExam.department.id) {
        setOptions([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/departements/${newExam.department.id}/options`
        );
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [newExam.department.id]);

  // Fetch modules based on the selected option
  useEffect(() => {
    const fetchModules = async () => {
      if (!newExam.option.id) {
        setModules([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/modules/options/${newExam.option.id}`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };
    fetchModules();
  }, [newExam.option.id]);

  // Handle form submission
  const handleAddExam = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:8088/api/exams", newExam);
      console.log("Exam added successfully:", response.data);
      setShowExamModal(false);
    } catch (error) {
      console.error("Error adding exam:", error);
      alert("Error adding exam");
    }
  };

  // Prepare the options for React Select (locaux)
  const locauxOptions = locaux.map((local) => ({
    value: local.id,
    label: `${local.nom} - Taille: ${local.taille}`,
  }));

  return (
    <Dialog open={showExamModal} onOpenChange={setShowExamModal}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Ajouter un Examen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddExam} className="grid gap-4 py-4">
          {/* Department Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Département</Label>
            <select
              id="department"
              value={newExam.department.id.toString()}
              onChange={(e) => {
                setNewExam({
                  ...newExam,
                  department: departements.find((dept) => dept.id === parseInt(e.target.value)) || {
                    id: 0,
                    departmentName: "",
                    options: [],
                    enseignants: [],
                  },
                  enseignant: { id: 0, name: "", department: newExam.department },
                  option: { id: 0, nomDeFiliere: "", annee: 0, nbrInscrit: 0, department: newExam.department },
                  module: { id: 0, nomModule: "", option: null },
                });
              }}
              className="col-span-3 p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner le département</option>
              {departements.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Enseignant Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="enseignant" className="text-right">Enseignant</Label>
            <select
              id="enseignant"
              value={newExam.enseignant.id.toString()}
              onChange={(e) => {
                setNewExam({
                  ...newExam,
                  enseignant: enseignants.find((ens) => ens.id === parseInt(e.target.value)) || {
                    id: 0,
                    name: "",
                    department: newExam.department,
                  },
                });
              }}
              className="col-span-3 p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner l'enseignant</option>
              {enseignants.map((ens) => (
                <option key={ens.id} value={ens.id}>
                  {ens.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="option" className="text-right">Option</Label>
            <select
              id="option"
              value={newExam.option.id.toString()}
              onChange={(e) => {
                setNewExam({
                  ...newExam,
                  option: options.find((opt) => opt.id === parseInt(e.target.value)) || {
                    id: 0,
                    nomDeFiliere: "",
                    annee: 0,
                    nbrInscrit: 0,
                    department: newExam.department,
                  },
                  module: { id: 0, nomModule: "", option: newExam.option },
                });
              }}
              className="col-span-3 p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner l'option</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nomDeFiliere} {option.annee}
                </option>
              ))}
            </select>
          </div>

          {/* Module Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="module" className="text-right">Module</Label>
            <select
              id="module"
              value={newExam.module.id.toString()}
              onChange={(e) => {
                setNewExam({
                  ...newExam,
                  module: modules.find((mod) => mod.id === parseInt(e.target.value)) || {
                    id: 0,
                    nomModule: "",
                    option: newExam.option,
                  },
                });
              }}
              className="col-span-3 p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner le module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.nomModule}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <input
              type="date"
              id="date"
              value={newExam.date}
              onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
              className="col-span-3 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">Heure de début</Label>
            <input
              type="time"
              id="startTime"
              value={newExam.startTime}
              onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
              className="col-span-3 p-2 border rounded-lg"
              required
            />
          </div>

          {/* End Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">Heure de fin</Label>
            <input
              type="time"
              id="endTime"
              value={newExam.endTime}
              onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
              className="col-span-3 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Dialog Footer */}
          <div className="flex justify-end space-x-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit">Enregistrer l'examen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamModal;