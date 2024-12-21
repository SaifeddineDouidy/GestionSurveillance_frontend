import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faCopyright,
} from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 fixed bottom-0 left-0 right-0 z-50 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* University / School Info */}
        <div className="text-sm md:text-base">
          © 2024/2025 - Université Chouaib Doukkali, Ecole Nationale des Sciences Appliquées
        </div>

        {/* All Rights Reserved */}
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <FontAwesomeIcon icon={faCopyright} />
          <span>All rights reserved</span>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <FontAwesomeIcon icon={faPhone} />
          <span>+212655593397</span>
        </div>
      </div>
    </footer>
  );
}
