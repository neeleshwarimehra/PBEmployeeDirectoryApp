import { useState, useMemo, useRef, useCallback } from "react";
import { Search, Mic, SlidersHorizontal, X, Check, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// import { useAuth } from "../context/AuthProvider";
import { getUser } from "../utils/storage";
import { useEffect } from "react";
import { getEmployeesApi } from "../api/authApi";
import { saveEmployeesSeachData } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { logGoogleAnalytics } from "../services/analytics-actions";
// import FirebaseTestButton from "../components/FirebaseTestButton";

import {
  getDirectoryData,
  getToken,
  saveEMPLOYEES_DATA_LIST,
} from "../utils/storage";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { requestSpeechPermission } from "../utils/speechpermission";
import axios from "axios";
import {
  EmployeeProfile,
  Employees,
  Designations,
  Stations,
} from "../models/employees";

const avatarColors = [
  "bg-[#A8E6CF]",
  "bg-[#FFD3B6]",
  "bg-[#FFAAA5]",
  "bg-[#B4D5F0]",
  "bg-[#D4A5A5]",
  "bg-[#FFDAB9]",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length];
}

// Shorten office labels for display
function shortOffice(loc: string) {
  return loc.replace(", New Delhi", "");
}

export function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showAudioSearch, setShowAudioSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  //====================
  const [employees, setEmployees] = useState<Employees[]>([]);
  const [allDesignations, setAllDesignations] = useState<Designations[]>([]);
  const [allOffices, setAllOffices] = useState<Stations[]>([]);

  const [selectedDesignation, setSelectedDesignation] =
    useState<Designations | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Stations | null>(null);
  const [pendingDesignation, setPendingDesignation] =
    useState<Designations | null>(null);
  const [pendingOffice, setPendingOffice] = useState<Stations | null>(null);
  ///====================================
  ///====================================
  const [searchDesignation, setSearchDesignation] = useState("");
  const [searchOffice, setSearchOffice] = useState("");
  const [userData, setUserData] = useState<any>(null);
  ///====================================
  // const isLive = true;
  const isLive = false;
  const [activeMode, setActiveMode] = useState<"search" | "reset">("reset");

  ///====================================
  // const filteredContacts = employees || [];
  // const filteredContacts = useMemo(() => {
  //   return [...employees]
  //     .sort((a, b) => (a.Name || "").localeCompare(b.Name || ""))
  //     .filter((emp) =>
  //       emp.Name?.toLowerCase().includes(searchQuery.toLowerCase()),
  //     );
  // }, [employees, searchQuery]);

  const filteredContacts = useMemo(() => {
    return [...employees].sort((a, b) =>
      (a.Name || "").localeCompare(b.Name || ""),
    );
  }, [employees]);

  const filteredDesignations = useMemo(() => {
    return allDesignations.filter((d) =>
      d.Name?.toLowerCase().includes(searchDesignation.toLowerCase()),
    );
  }, [allDesignations, searchDesignation]);

  const filteredOffices = useMemo(() => {
    return allOffices.filter((o) =>
      o.StationName?.toLowerCase().includes(searchOffice.toLowerCase()),
    );
  }, [allOffices, searchOffice]);
  ///====================================
  ///====================================

  const activeFilterCount =
    (selectedDesignation ? 1 : 0) + (selectedOffice ? 1 : 0);
  //====================
  //=================
  //====================
  //=================
  ///loadDirectory
  //===============
  //====================
  const loadDirectory = async () => {
    try {
      setLoading(true);

      // Optional delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const data = await getDirectoryData();

      console.log("Directory Data: homepage", data);

      const employees = data?.employees || [];
      const designations = data?.designations || [];
      const stations = data?.stations || [];
      saveEMPLOYEES_DATA_LIST(employees || []);
      setEmployees(employees || []);
      setAllDesignations(designations || []);
      setAllOffices(stations || []);
    } catch (error) {
      console.error("Failed to load directory:", error);

      setEmployees([]);
      setAllDesignations([]);
      setAllOffices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
    logGoogleAnalytics.homeView();
  }, []);

  //===============
  //====================
  //=====
  //NAVIGATION
  // const handleGoToContactDetails = (empCode: number) => {
  //   navigate(`/employee/${empCode}`);
  // };

  const handleGoToContactDetails = (contact: Employees) => {
    navigate(`/app/contact/${contact.EmpCode}`, {
      state: contact,
    });
    console.log("contact contact.EmpCod", contact.EmpCode);
    console.log("contact Home", contact);
  };

  ///==================================================================
  ///==================================================================
  // RESET FUNCTION (LOAD FROM PREFS)
  const handleResetEmployeeList = async () => {
    setActiveMode("reset");
    logGoogleAnalytics.resetButton();
    // if (loading) return;
    try {
      setLoading(true);
      // 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSearchQuery("");
      resetFilter();

      await loadDirectory(); // get employees from directory
      logGoogleAnalytics.resetEmployeeList();
      toast.success("Reset Employee List Successful.");
    } catch (error) {
      toast.error("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  ///==================================================================
  ///==================================================================
  const handleSearch = async () => {
    setEmployees([]);
    setActiveMode("search");
    logGoogleAnalytics.searchEmployee();
    if (isLive) {
      await handleSearchEmployeesAPIMain();
    } else {
      await handleSearchStatic();
    }
  };
  const handleSearchStatic = async () => {
    logGoogleAnalytics.searchEmployee();
    // if (loading) return;
    try {
      setLoading(true);
      // 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = {
        success: true,
        totalRecords: 1,
        data: [
          {
            EmpCode: 7570501,
            Name: "AJAY ",
            DOB: "1967-02-05T00:00:00.000Z",
            Mobile: "1234567890",
            Email: "test@gmail.com",
            DesignationId: 24,
            DesignationName: "Assistant Engineer (CIVIL)",
            StationId: 2430,
            StationName: "PB-DELHI CE-LEVEL-I - CCW",
          },
          {
            EmpCode: 7570502,
            Name: "TEST  ",
            DOB: "1967-02-05T00:00:00.000Z",
            Mobile: "1234567890",
            Email: "test@gmail.com",
            DesignationId: 24,
            DesignationName: "Assistant Engineer (CIVIL)",
            StationId: 2430,
            StationName: "PB-DELHI CE-LEVEL-I - CCW",
          },
        ],
      };

      console.log("response", response);

      if (response?.success) {
        const employeesEachResultData = response?.data || [];

        setEmployees(employeesEachResultData);

        console.log("employeesEachResultData", employeesEachResultData);

        // SAVE TO STORAGE
        await saveEmployeesSeachData(employeesEachResultData);

        toast.success(
          `Search completed successfully. Found ${employeesEachResultData.length} employee(s)`,
        );
      }
    } catch (error) {
      console.log(error);
      console.log("search employees error");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  //====================

  const handleSearchEmployeesAPIMain = async () => {
    //Handing params
    // designationId: selectedDesignation?.Id,
    // designationName: selectedDesignation?.Name,
    // query: searchQuery,
    //  stationId: selectedOffice?.StationId,
    // stationName: selectedOffice?.StationName,

    //     {
    //       "query": "test",
    //       "designationId": 24,
    //       "stnId": ""
    // }

    const query = searchQuery;
    const designationId = selectedDesignation?.Id;
    const stnId = userData.stnId;
    const token = (await getToken()) || "";
    console.log("query", query);
    console.log("designationId", designationId);
    console.log("stnId", stnId);
    console.log("token", token);

    if (loading) return;
    try {
      setLoading(true);
      // 2-second delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      const response = await getEmployeesApi(
        token,
        query,
        designationId,
        stnId,
      );
      console.log("response", response);
      if (response?.success) {
        const employeesEachResultData = response?.data || [];
        setEmployees(employeesEachResultData);
        console.log("employeesEachResultData", employeesEachResultData);
        // SAVE TO STORAGE
        await saveEmployeesSeachData(employeesEachResultData);
        toast.success(
          `Search completed successfully. Found ${employeesEachResultData.length} employee(s).`,
        );
      }
    } catch (error: any) {
      console.log("Failed to load employees", error);
      console.log("search employees error?.message", error?.message);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  ///============
  //AUDIO SEARCH =======***************===========
  //AUDIO SEARCH =======***************===========
  useEffect(() => {
    if (searchQuery.trim()) {
      closeAudioSearch(); // Close popup
    }
  }, [searchQuery]);
  const openAudioSearch = () => {
    // setShowAudioSearch(true);
    setShowAudioSearch(false);
  };
  const handleAudioClick = async () => {
    try {
      const platform = Capacitor.getPlatform();
      logGoogleAnalytics.audioSearch();
      console.log("Platform:", platform);

      // Browser
      if (platform === "web") {
        console.log("Using browser speech recognition");
        startBrowserVoiceSearch();
        return;
      }

      // Android / iOS
      let permission = await SpeechRecognition.checkPermissions();

      console.log("Current Permission:", permission.speechRecognition);

      if (permission.speechRecognition !== "granted") {
        console.log("Requesting permission...");

        permission = await SpeechRecognition.requestPermissions();

        console.log("Updated Permission:", permission.speechRecognition);
      }

      if (permission.speechRecognition !== "granted") {
        toast.error("Microphone permission is required.");
        return;
      }

      console.log("Permission granted");

      toast.success("Listening...");

      await startNativeVoiceSearch();
    } catch (error: any) {
      console.error("Voice Search Error:", error);

      // toast.error(error?.message || "Voice search failed");
      toast.error("Voice search failed");
    }
  };
  const startBrowserVoiceSearch = () => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      toast.error("Speech recognition not supported");
      return;
    }

    const rec = new SR();

    rec.lang = "en-IN";
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      console.log("Transcript:", transcript);
      closeAudioSearch(); // Close popup
    };

    rec.start();
  };
  const startNativeVoiceSearch = async () => {
    const result = await SpeechRecognition.start({
      language: "en-IN",
      maxResults: 1,
      partialResults: false,
      popup: true,
    });

    if (result.matches?.length) {
      setSearchQuery(result.matches[0]);
      closeAudioSearch(); // Close popup
    }
  };

  const startVoiceSearch = async () => {
    try {
      const available = await SpeechRecognition.available();

      console.log("Available:", available);

      if (!available.available) {
        toast.error("Speech recognition is not available.");
        return;
      }

      setIsListening(true);

      const result = await SpeechRecognition.start({
        language: "en-IN",
        maxResults: 1,
        partialResults: false,
        popup: true,
      });

      console.log("Result:", result);

      if (result.matches?.length) {
        setSearchQuery(result.matches[0]);
        setShowAudioSearch(false);
      }
    } catch (error) {
      console.error("Speech Error:", error);
      // toast.error("Voice search failed.");
    } finally {
      setIsListening(false);
    }
  };

  const closeAudioSearch = async () => {
    try {
      await SpeechRecognition.stop();
    } catch (error) {
      console.log(error);
    }

    setShowAudioSearch(false);
    setIsListening(false);
  };
  //AUDIO SEARCH =======***************===========
  //AUDIO SEARCH =======***************===========
  //FILTERS =======***************===========
  const openFilter = () => {
    setPendingDesignation(selectedDesignation);
    setPendingOffice(selectedOffice);
    setShowFilter(true);
  };

  const applyFilter = () => {
    setSelectedDesignation(pendingDesignation);
    setSelectedOffice(pendingOffice);
    setShowFilter(false);
    logGoogleAnalytics.applyFilter();
    console.log("pendingDesignation", pendingDesignation);
    console.log("pendingOffice", pendingOffice);
    console.log("selectedDesignation", selectedDesignation);
    console.log("selectedOffice", selectedOffice);
  };

  const resetFilter = () => {
    logGoogleAnalytics.resetFilter();
    setPendingDesignation(null);
    setPendingOffice(null);

    setSelectedDesignation(null);
    setSelectedOffice(null);

    setSearchDesignation("");
    setSearchOffice("");
    setTimeout(() => {
      setShowFilter(false);
    }, 0);
  };

  console.log(allDesignations);
  console.log(allOffices);

  //===== AUTH USER DATA =====
  useEffect(() => {
    const loadUser = async () => {
      const data = await getUser();

      console.log("getUser", data);

      setUserData(data);
    };

    loadUser();
  }, []);

  const currentUser = userData || {
    EmployeeId: "N/A",
    Name: "N/A",
    Mobile: "N/A",
    Email: "N/A",
    DesignationId: "N/A",
    DesignationName: "N/A",
    StationId: "N/A",
    StationName: "N/A",
  };

  console.log("Authenticated user: home screen", currentUser);
  //=====

  return (
    <div className="h-full flex flex-col bg-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A3A6B] px-6 pt-4 pb-5 ">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-semibold">
              Welcome,{<br />}
              <b className="font-medium text-yellow-300">
                <em>{currentUser?.Name ?? "NA"} !</em>
              </b>
            </h1>
            <p className="text-white text-medium text-semibold">
              Prasar Bharati Employee Directory
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 ">
          <div
            className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white transition-all ${
              isListening ? "ring-2 ring-[#F4832A]" : ""
            }`}
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isListening
                  ? "Listening…"
                  : "Search by name, mobile number, designation or station"
              }
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
            />
            {/* Mic icon inside input */}
            <button
              // onClick={openAudioSearch}
              onClick={handleAudioClick}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 bg-[#1A3A6B] hover:bg-[#F4832A]"
              title="Voice search"
            >
              <Mic className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Filter button */}
          <button
            onClick={openFilter}
            className="relative w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5 text-orange-500" />
            {"  "}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F4832A] text-white text-[11px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {/* //================================================ */}
      {/* //================================================ */}
      {/* SELECTED FILTER SUMMARY MAIN VIEW*/}
      {/* //================================================ */}
      {/* Active designation/office filter pills */}
      {/* SELECTED FILTER SUMMARY MAIN VIEW*/}
      {/* //================================================ */}
      {/* // */}
      <div className="px-6 py-2 bg-[#1A3A6B] flex flex-wrap gap-2 border-b border-gray-100">
        {/* Designation */}
        {(selectedDesignation || selectedOffice) && (
          <div className="px-6 py-2 bg-[#1A3A6B] flex flex-wrap gap-2">
            {/* Designation */}
            {selectedDesignation && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                {selectedDesignation.Name}
              </div>
            )}

            {/* Office */}
            {selectedOffice && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                {shortOffice(selectedOffice.StationName)}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!pendingDesignation && !pendingOffice && (
          <p className="text-sm text-gray-300">
            Search / filter employee by name, mobile number, designation or
            station.
          </p>
        )}
      </div>
      {/* //================================================ */}
      {/* Search and Reset buttons */}
      {/* Search and Reset buttons */}
      {/* Search and Reset buttons */}
      {/* //==================================================== */}
      {/* //==================================================== */}
      <div className="px-6 py-2 bg-[#1A3A6B] flex flex-wrap gap-2 border-b border-gray-100">
        {/* RESET BUTTON (RED / DANGER STYLE) */}
        {/* RESET BUTTON */}
        <button
          onClick={handleResetEmployeeList}
          disabled={loading}
          className={`flex-1 py-3 rounded-xl text-sm font-bold text-white
      bg-gradient-to-r from-[#860084] to-[#860084]
      shadow-lg
      hover:from-[#04d0f0] hover:to-[#01d4c3]
      transition-all duration-200
      ${
        activeMode === "reset"
          ? "ring-4 ring-blue-400 border-2 border-yellow-300"
          : "border-2 border-transparent"
      }`}
        >
          {activeMode === "reset" && "✓ "}
          Reset Employees
        </button>

        {/* ///=========== */}
        {/* Test Error Boundary crashlytics */}
        {/* //NNN */}
        {/* <FirebaseTestButton /> */}
        {/* ///=========== */}
        {/* SEARCH BUTTON */}

        <button
          onClick={handleSearch}
          disabled={loading}
          className={`flex-1 py-3 rounded-xl text-sm font-bold text-white
      bg-gradient-to-r from-orange-500 to-orange-600
      shadow-lg
      hover:from-[#04d0f0] hover:to-[#01d4c3]
      transition-all duration-200
      ${
        activeMode === "search"
          ? "ring-4 ring-blue-400 border-2 border-yellow-300"
          : "border-2 border-transparent"
      }`}
        >
          {activeMode === "search" && "✓ "}
          Search
        </button>
      </div>

      {/* ///////////// */}

      {/* //==================================================== */}
      {/* //==================================================== */}
      {/* Divider */}
      <div className="h-px bg-gray-100 mx-0" />
      {/* //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-2.5 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {filteredContacts.length} employee
            {filteredContacts.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {filteredContacts.length > 0 ? (
          <div>
            {filteredContacts.map((contact, index) => {
              const firstLetter = contact.Name[0].toUpperCase();
              const prevLetter =
                index > 0
                  ? filteredContacts[index - 1].Name[0].toUpperCase()
                  : null;
              const showLetter = firstLetter !== prevLetter;

              return (
                <div
                  key={contact.EmpCode}
                  className="bg-white hover:bg-yellow-50 border-2 rounded-lg mx-3 mb-3  border-gray-200 hover:border-orange-300 transition-colors"
                >
                  {showLetter && (
                    <div className="px-6 py-1.5 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-400">
                        {firstLetter}
                      </span>
                    </div>
                  )}
                  <div
                    onClick={() => handleGoToContactDetails(contact)}
                    className="px-6 py-3 flex items-center gap-3 active:bg-gray-50 cursor-pointer border-b border-gray-50"
                  >
                    <div
                      className={`w-11 h-11 rounded-full ${getAvatarColor(
                        index,
                      )} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-gray-800 font-semibold text-xs">
                        {getInitials(contact.Name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {contact.Name}
                      </h3>
                      <p className="text-xs text-blue-500">{contact.Email}</p>
                      {contact.Mobile ? (
                        <p className="text-xs text-gray-600">
                          +91 {contact.Mobile}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Mobile Number not available
                        </p>
                      )}
                      {/* <p className="text-xs text-black-500">{contact.Mobile || 'N/A'}</p> */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#1A3A6B]/8 text-[#1A3A6B] font-medium">
                          {contact.DesignationName}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-black-300">
                          {shortOffice(contact.StationName)}
                        </span>
                      </div>
                    </div>

                    <div>
                      {contact.Mobile ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${contact.Mobile?.replace(
                              /\s+/g,
                              "",
                            )}`;
                            console.log(`Initiating call to ${contact.Mobile}`);
                          }}
                          className="w-9 h-9 rounded-full bg-[#1A3A6B] flex items-center justify-center flex-shrink-0"
                        >
                          <Phone className="w-4 h-4 text-white" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm mb-1">
              No contacts found
            </h3>
            <p className="text-xs text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
      {/* Filter Bottom Sheet */}
      {/* //============================================================= */}
      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilter(false)}
            />

            {/* Sheet */}
            <motion.div
              className="relative bg-white rounded-t-3xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1"></div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b">
                <p className="text-gray-900 text-base">
                  Filter Contacts by Designation and Office
                </p>

                <button
                  onClick={() => setShowFilter(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* //=== */}
              {/* SELECTED FILTER SUMMARY in filter view */}

              {/* //================================================ */}

              {/* ================= BODY (VERTICAL 50 / 50 SPLIT) ================= */}
              <div className="px-6 py-4">
                <div className="flex flex-col h-[55vh]">
                  {/* ================= TOP: DESIGNATION ================= */}
                  <div className="h-1/2 flex flex-col border-b border-gray-200 pb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      1. Designation
                    </p>

                    {/* Search */}
                    <input
                      type="text"
                      value={searchDesignation}
                      onChange={(e) => setSearchDesignation(e.target.value)}
                      placeholder="Search Designation"
                      className="w-full px-3 py-2 mb-2 rounded-lg border text-sm outline-none"
                    />

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {filteredDesignations.map((d) => (
                        <button
                          key={d.Id}
                          onClick={() => setPendingDesignation(d)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${
                        pendingDesignation?.Id === d.Id
                          ? "bg-[#1A3A6B] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                        >
                          {d.Name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ================= BOTTOM: OFFICE ================= */}
                  <div className="h-1/2 flex flex-col pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      2. Office
                    </p>

                    {/* Search */}
                    <input
                      type="text"
                      value={searchOffice}
                      onChange={(e) => setSearchOffice(e.target.value)}
                      placeholder="Search Office"
                      className="w-full px-3 py-2 mb-2 rounded-lg border text-sm outline-none"
                    />

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {filteredOffices.map((o) => (
                        <button
                          key={o.StationId}
                          onClick={() => setPendingOffice(o)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${
                        pendingOffice?.StationId === o.StationId
                          ? "bg-[#1A3A6B] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                        >
                          {shortOffice(o.StationName)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= FOOTER ================= */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={resetFilter}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium"
                >
                  Reset
                </button>

                <button
                  onClick={applyFilter}
                  className="flex-1 py-3 rounded-xl bg-[#1A3A6B] text-white text-sm font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Filter Bottom Sheet */}
      {/* //============================================================= */}
      {/* //============================================================= */}
      {/* Audio Search Modal */}
      <AnimatePresence>
        {showAudioSearch && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={closeAudioSearch}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-3xl w-[85%] max-w-[320px] px-8 py-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={closeAudioSearch}
                className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <X size={28} className="text-gray-700" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-900 mb-8">
                  Audio Search
                </h2>

                {/* Mic Icon */}
                <motion.div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                    isListening ? "bg-red-500 animate-pulse" : "bg-gray-300"
                  }`}
                  animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Mic className="w-12 h-12 text-white" />
                </motion.div>

                {/* Status Text */}
                <p className="text-gray-600 text-center mb-8">
                  {isListening
                    ? "Listening..."
                    : "Say something, I'm listening!"}
                </p>

                {/* Action Button */}
                <button
                  onClick={handleAudioClick}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                    isListening
                      ? "bg-red-500 active:bg-red-600"
                      : "bg-[#1A3A6B] active:bg-[#0f2847]"
                  }`}
                >
                  {isListening ? "Stop Recording" : "Start Recording"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Loader visible={loading} />
    </div>
  );
}
