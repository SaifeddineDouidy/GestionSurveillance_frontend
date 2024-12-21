import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Select from "react-select";


interface SelectedSlot {
    day: string;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
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
    disponible: boolean;
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
// Updated interfaces to match backend model
interface Exam {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  departement: Department;
  enseignant: Enseignant;
  option: Option;
  module: Module;
  sessionId: string;
}


interface AddExamModalProps {
  showExamModal: boolean;
  setShowExamModal: (value: boolean) => void;
  selectedSlot?: SelectedSlot;
  onExamAdded?: () => void;
}

interface SessionState {
  departement: string;
  enseignant: string;
  option: string;
  module: string;
  locaux: string[];
  date: string | undefined;
  startTime: string | undefined;
  endTime: string | undefined;
  isManuelle: boolean;
  sessionId: string | null;
}

const AddExamModal: React.FC<AddExamModalProps> = ({
  showExamModal,
  setShowExamModal,
  selectedSlot,
  onExamAdded, 
}) => {
  const [departements, setDepartements] = useState<Department[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [locaux, setLocaux] = useState<Local[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session state
  const [newSession, setNewSession] = useState<SessionState>({
    departement: "",
    enseignant: "",
    option: "",
    module: "",
    locaux: [],
    date: selectedSlot?.day,
    startTime: selectedSlot?.timeSlot?.startTime,
    endTime: selectedSlot?.timeSlot?.endTime,
    isManuelle: false,
    sessionId: sessionId,
  });

  useEffect(() => {
      const storedSessionId = localStorage.getItem("sessionId");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        console.error("No sessionId found in localStorage.");
      }
    }, []);
  
  // Modified automatic locaux selection logic
  const selectLocauxAutomatically = () => {
    console.log("=== Starting Automatic Locaux Selection ===");
    
    if (!newSession.option || newSession.isManuelle) {
      console.log("Skipping auto selection - manual mode or no option selected");
      return;
    }

    const selectedOption = options.find(opt => opt.id.toString() === newSession.option);
    if (!selectedOption) {
      console.log("Selected option not found:", newSession.option);
      return;
    }

    const nbrInscrit = selectedOption.nbrInscrit;
    console.log("Students to accommodate:", nbrInscrit);

    // Sort locaux by size in descending order for efficiency
    const sortedLocaux = [...locaux].sort((a, b) => b.taille - a.taille);
    console.log("Available sorted locaux:", sortedLocaux.map(l => `${l.nom} (${l.taille})`));

    let bestCombination: Local[] = [];
    let bestTotalCapacity = 0;
    let smallestExcess = Infinity;

    // Function to calculate total capacity of a combination
    const calculateCapacity = (rooms: Local[]): number => {
        return rooms.reduce((sum, room) => sum + room.taille, 0);
    };

    // Try different combinations of locaux
    for (let i = 0; i < sortedLocaux.length; i++) {
        let currentCombination: Local[] = [];
        let currentCapacity = 0;
        
        // Start with the current room
        for (let j = i; j < sortedLocaux.length; j++) {
            // Add this room to our current combination
            currentCombination.push(sortedLocaux[j]);
            currentCapacity = calculateCapacity(currentCombination);
            
            console.log(`Trying combination:`, 
                currentCombination.map(l => `${l.nom} (${l.taille})`),
                `Total: ${currentCapacity}`
            );

            // If we've found a valid combination
            if (currentCapacity >= nbrInscrit) {
                const excess = currentCapacity - nbrInscrit;
                
                // If this combination has less excess capacity than our previous best
                if (excess < smallestExcess) {
                    smallestExcess = excess;
                    bestCombination = [...currentCombination];
                    bestTotalCapacity = currentCapacity;
                    
                    console.log("New best combination found:", {
                        rooms: bestCombination.map(l => `${l.nom} (${l.taille})`),
                        capacity: bestTotalCapacity,
                        excess: smallestExcess
                    });
                }
                break; // Move to next starting room
            }
        }
    }

    if (bestCombination.length > 0) {
        console.log("=== Final Selection ===");
        console.log("Selected rooms:", bestCombination.map(l => `${l.nom} (${l.taille})`));
        console.log("Total capacity:", bestTotalCapacity);
        console.log("Required capacity:", nbrInscrit);
        console.log("Excess capacity:", smallestExcess);

        setNewSession(prev => ({
            ...prev,
            locaux: bestCombination.map(local => local.id)
        }));
    } else {
        console.warn("No suitable combination found");
        alert(`Impossible de trouver une combinaison de salles pour ${nbrInscrit} étudiants`);
        setNewSession(prev => ({
            ...prev,
            locaux: []
        }));
    }
};

  // Trigger automatic selection when option changes
  useEffect(() => {
    if (!newSession.isManuelle && newSession.option) {
      selectLocauxAutomatically();
    }
  }, [newSession.option, newSession.isManuelle]);

  

  // Modified form submission
  const handleAddSession = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("=== Starting Form Submission ===");

    if (newSession.locaux.length === 0) {
      console.error("No locaux selected");
      alert("Veuillez sélectionner au moins un local");
      return;
    }
    if (!newSession.startTime || !newSession.endTime || !newSession.date) {
      console.error("Date or time fields are missing");
      alert("Veuillez remplir les champs de date et d'heure");
      return;
    }
    const formattedDate = typeof newSession.date === "string"
    ? newSession.date
    : new Date(newSession.date).toISOString().split("T")[0];
    const formattedStartTime = newSession.startTime.padEnd(5, ':00'); // Ensure HH:mm format
    const formattedEndTime = newSession.endTime.padEnd(5, ':00');

    // Format the exam payload to match backend expectations
    const examPayload = {
      date: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      departement: parseInt(newSession.departement),
      enseignant: parseInt(newSession.enseignant),
      option: parseInt(newSession.option),
      module: parseInt(newSession.module),
      locauxIds: newSession.locaux.map((id) => parseInt(id)),
      sessionId: sessionId,
    };

    console.log("Submitting exam payload:");
    console.log(examPayload);

    try {
      const response = await axios.post("http://localhost:8088/api/exams", examPayload);
      console.log("Exam created successfully:", response.data);
      if (onExamAdded) {
        onExamAdded();
      }
      setShowExamModal(false);
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Erreur lors de la création de l'examen");
    }
  };
  

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
        const response = await axios.get("http://localhost:8088/api/locaux?disponible=true");
        setLocaux(response.data);
        console.log("local available:", locaux);
      } catch (error) {
        console.error("Error fetching locaux:", error);
      }
    };
    fetchLocaux();
  }, []);

  // Fetch enseignants based on selected departement
  useEffect(() => {
    const fetchEnseignants = async () => {
      if (!newSession.departement) {
        setEnseignants([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/departements/${newSession.departement}/enseignants`
        );
        setEnseignants(response.data);
      } catch (error) {
        console.error("Error fetching enseignants:", error);
      }
    };
    fetchEnseignants();
  }, [newSession.departement]);

  // Fetch options based on the selected departement
  useEffect(() => {
    const fetchOptions = async () => {
      if (!newSession.departement) {
        setOptions([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/departements/${newSession.departement}/options`
        );
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [newSession.departement]);

  // Fetch modules based on the selected option
  useEffect(() => {
    const fetchModules = async () => {
      if (!newSession.option) {
        setModules([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8088/api/options/${newSession.option}/modules`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };
    fetchModules();
  }, [newSession.option]);

 


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

        <form onSubmit={handleAddSession} className="grid gap-4 py-4">
          {/* Département Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departement" className="text-right">Département</Label>
            <select
              id="departement"
              value={newSession.departement}
              onChange={(e) => {
                setNewSession({
                  ...newSession,
                  departement: e.target.value,
                  enseignant: "",
                  option: "",
                  module: "",
                  locaux: [],
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
              value={newSession.enseignant}
              onChange={(e) => setNewSession({ ...newSession, enseignant: e.target.value })}
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
              value={newSession.option}
              onChange={(e) => {
                setNewSession({
                  ...newSession,
                  option: e.target.value,
                  module: "",
                  locaux: [],
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
              value={newSession.module}
              onChange={(e) => setNewSession({ ...newSession, module: e.target.value })}
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

          {/* Mode Radio Buttons */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isManuelle" className="text-right">Mode</Label>
            <RadioGroup
  value={newSession.isManuelle ? "manuelle" : "automatique"}
  onValueChange={(value) => {
    setNewSession({
      ...newSession,
      isManuelle: value === "manuelle",
      locaux: [],
    });
  }}
>
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <RadioGroupItem
        value="automatique"
        id="automatique"
        className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            newSession.isManuelle ? "bg-transparent" : "bg-blue-500"
          }`}
        />
      </RadioGroupItem>
      <Label htmlFor="automatique" className="cursor-pointer">
        Automatique
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem
        value="manuelle"
        id="manuelle"
        className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center"
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            newSession.isManuelle ? "bg-blue-500" : "bg-transparent"
          }`}
        />
      </RadioGroupItem>
      <Label htmlFor="manuelle" className="cursor-pointer">
        Manuelle
      </Label>
    </div>
  </div>
</RadioGroup>

          </div>

          {/* Locaux Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locaux" className="text-right">Locaux</Label>
            <div className="col-span-3">
              <Select
                isMulti
                name="locaux"
                options={locauxOptions}
                value={locauxOptions.filter((option) => newSession.locaux.includes(option.value))}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions.map((option) => option.value);
                  setNewSession({ ...newSession, locaux: selectedValues });
                }}
                className="w-full"
                isDisabled={!newSession.isManuelle}
              />
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex justify-end space-x-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" variant="blue">Enregistrer l'examen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamModal;
