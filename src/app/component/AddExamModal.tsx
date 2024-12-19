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

const AddExamModal: React.FC<AddExamModalProps> = ({
    showExamModal,
    setShowExamModal,
    selectedSlot,
  }) =>{
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
  const [newSession, setNewSession] = useState<{
    departement: string;
    enseignant: string;
    option: string;
    module: string;
    locaux: string[]; 
    date: string | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    isManuelle: boolean;
  }>({
    departement: "",
    enseignant: "",
    option: "",
    module: "",
    locaux: [],
    date: selectedSlot?.day,
    startTime: selectedSlot?.timeSlot?.startTime,
    endTime: selectedSlot?.timeSlot?.endTime,
    isManuelle: false, 
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
          `http://localhost:8088/api/modules/options/${newSession.option}`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };
    fetchModules();
  }, [newSession.option]);

 

 // Automatically select locaux when option or mode changes
    useEffect(() => {
        if (newSession.isManuelle || !newSession.option) return;

    
        // Get the selected option
        const selectedOption = options.find((opt) => opt.id === newSession.option);
        console.log(selectedOption)
        if (!selectedOption) {
        console.log("No option found for automatic locaux selection");
        return;
        }
        

    
        const nbrInscrit = selectedOption.nbrInscrit;
        console.log("Number of students required: ", nbrInscrit);
    
        // Sort the locaux by size (taille) in ascending order
        const sortedLocaux = [...locaux].sort((a, b) => a.taille - b.taille);
        console.log("Sorted locaux by taille (ascending order): ", sortedLocaux);
    
        let selectedLocaux = [];
        let totalTaille = 0;
    
        // Iterate over sorted locaux to select those that fit the number of students
        for (let i = 0; i < sortedLocaux.length; i++) {
        const local = sortedLocaux[i];
        console.log(`Checking local: ${local.nom}, taille: ${local.taille}`);
    
        // Check if adding this local fits the required number of students
        if (totalTaille + local.taille <= nbrInscrit) {
            selectedLocaux.push(local);
            totalTaille += local.taille;
            console.log(`Selected ${local.nom} (taille: ${local.taille}), total taille so far: ${totalTaille}`);
        } else {
            console.log(`Skipping ${local.nom} (taille: ${local.taille}), total taille exceeds required: ${totalTaille}`);
        }
    
        // Stop the loop if we've selected enough locaux
        if (totalTaille >= nbrInscrit) {
            console.log(`Reached required number of students: ${nbrInscrit}. Stopping selection.`);
            break;
        }
        }
    
        // If the total size of selected locaux is less than required, log a warning
        if (totalTaille < nbrInscrit) {
        console.log(`Warning: Not enough locaux selected to accommodate ${nbrInscrit} students. Total taille: ${totalTaille}`);
        } else {
        console.log("Final selected locaux: ", selectedLocaux);
        }
    
        // Update the new session with selected locaux
        setNewSession((prevState) => ({
        ...prevState,
        locaux: selectedLocaux.map((local) => local.id),
        }));
    
    }, [newSession.isManuelle, newSession.option, locaux, options, newSession]);
    
  

  // Handle form submission
  const handleAddSession = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    // Ensure locaux are selected before submission
    // if (!newSession.isManuelle && newSession.option) {
    //   selectLocauxAutomatically();
    // }

    // Validate that locaux are selected
    if (newSession.locaux.length === 0) {
      console.error("No locaux selected for submission");
      alert("Veuillez sélectionner au moins un local");
      return;
    }

    const examPayload = {
      departementId: newSession.departement,
      enseignantId: newSession.enseignant,
      optionId: newSession.option,
      moduleId: newSession.module,
      locauxIds: newSession.locaux,
      date: newSession.date,
      creneau: {
        startTime: newSession.startTime,
        endTime: newSession.endTime
      }
    };

    console.log("Submitting exam with data:", examPayload);
    
    try {
      const response = await axios.post("http://localhost:8088/api/exams", examPayload);
      console.log("Exam created successfully:", response.data);
      setShowExamModal(false);
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Erreur lors de la création de l'examen");
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
                <RadioGroupItem value="automatique" id="automatique" />
                <Label htmlFor="automatique">Automatique</Label>
                <RadioGroupItem value="manuelle" id="manuelle" />
                <Label htmlFor="manuelle">Manuelle</Label>
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
            <Button type="submit">Enregistrer l'examen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamModal;
