import { useState, useMemo, useEffect, useCallback } from "react";
import {
  WheelPicker,
  WheelPickerWrapper,
} from "@ncdai/react-wheel-picker";
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI, uploadAPI } from '../utils/api';

// Helper to get days in a month (handles leap years)
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// List of popular locations for autocomplete
const popularLocations = [
  "Paris", "Tokyo", "New York", "London", "Sydney",
  "Rome", "Barcelona", "Amsterdam", "Bangkok", "Cape Town",
  "Dubai", "San Francisco", "Rio de Janeiro", "Kyoto", "Vancouver"
];

export default function UserInfo() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize picker states with a valid date (e.g., current date)
  const [pickerDay, setPickerDay] = useState("");
  const [pickerMonth, setPickerMonth] = useState("");
  const [pickerYear, setPickerYear] = useState("");

  // States for additional steps
  const [currentLocation, setCurrentLocation] = useState("");
  const [favouriteTravelDestination, setFavouriteTravelDestination] = useState("");

  // States for tag-based inputs
  const [lastHolidayPlaces, setLastHolidayPlaces] = useState([]);
  const [currentLastHolidayPlaceInput, setCurrentLastHolidayPlaceInput] = useState("");
  const [lastHolidaySuggestions, setLastHolidaySuggestions] = useState([]);
  const [favouritePlacesToGo, setFavouritePlacesToGo] = useState([]);
  const [currentFavouritePlaceToGoInput, setCurrentFavouritePlaceToGoInput] = useState("");
  const [favouritePlaceSuggestions, setFavouritePlaceSuggestions] = useState([]);

  // Profile picture step state
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [showPicModal, setShowPicModal] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState("");

  const navigate = useNavigate();

  // Effect to synchronize picker states when DOB changes or picker is shown
  useEffect(() => {
    const initialDate = dob ? new Date(dob) : new Date();
    setPickerDay(String(initialDate.getDate()));
    setPickerMonth(String(initialDate.getMonth() + 1));
    setPickerYear(String(initialDate.getFullYear()));
  }, [dob, showDatePicker]);

  // Effect for autocomplete suggestions for Last Holiday Places
  useEffect(() => {
    if (currentLastHolidayPlaceInput.trim() === "") {
      setLastHolidaySuggestions([]);
      return;
    }
    const input = currentLastHolidayPlaceInput.toLowerCase();
    const suggestions = popularLocations.filter(location =>
      location.toLowerCase().startsWith(input)
    );
    setLastHolidaySuggestions(suggestions);
  }, [currentLastHolidayPlaceInput]);

  // Effect for autocomplete suggestions for Favourite Places to Go
  useEffect(() => {
    if (currentFavouritePlaceToGoInput.trim() === "") {
      setFavouritePlaceSuggestions([]);
      return;
    }
    const input = currentFavouritePlaceToGoInput.toLowerCase();
    const suggestions = popularLocations.filter(location =>
      location.toLowerCase().startsWith(input)
    );
    setFavouritePlaceSuggestions(suggestions);
  }, [currentFavouritePlaceToGoInput]);

  // Adjust pickerDay if month/year changes and the day becomes invalid
  const updatePickerDayBasedOnMonthYear = useCallback((year, month, day) => {
    const maxDays = getDaysInMonth(Number(year), Number(month) - 1);
    if (Number(day) > maxDays) {
      return String(maxDays);
    }
    return day;
  }, []);

  // Total logical steps for the progress bar
  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (step === 8 && profilePicUrl) {
      // Save user info to backend (including profilePicUrl)
      try {
        await userAPI.saveProfile({
          firstName,
          lastName,
          gender: gender === "Other" ? customGender : gender,
          dob,
          currentLocation,
          favouriteTravelDestination,
          lastHolidayPlaces,
          favouritePlacesToGo,
          profilePicUrl,
        });
        navigate('/referral');
      } catch (err) {
        alert("Failed to save user info: " + err.message);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) return navigate(-1);
    setStep(step - 1);
  };

  // Remove handleVerificationConfirm and handleVerificationEdit

  // Generate options for the WheelPicker components
  const dayOptions = useMemo(() => {
    const days = [];
    const maxDays = getDaysInMonth(Number(pickerYear), Number(pickerMonth) - 1);
    for (let i = 1; i <= maxDays; i++) {
      days.push({ label: String(i).padStart(2, '0'), value: String(i) });
    }
    return days;
  }, [pickerMonth, pickerYear]);

  const monthOptions = useMemo(() => {
    const months = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    for (let i = 0; i < 12; i++) {
      months.push({ label: monthNames[i], value: String(i + 1) });
    }
    return months;
  }, []);

  const yearOptions = useMemo(() => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 120; i <= currentYear + 1; i++) {
      years.push({ label: String(i), value: String(i) });
    }
    return years;
  }, []);

  const handleDateConfirm = () => {
    const year = Number(pickerYear);
    const month = Number(pickerMonth);
    const day = Number(updatePickerDayBasedOnMonthYear(pickerYear, pickerMonth, pickerDay));

    const selectedDate = new Date(year, month - 1, day);
    setDob(selectedDate.toISOString().split('T')[0]);
    setShowDatePicker(false);
  };

  // Helper function to parse place name and details
  const parsePlaceInput = (input) => {
    const match = input.match(/(.+?)\s*\((.+)\)/);
    if (match) {
      return { name: match[1].trim(), details: match[2].trim() };
    }
    return { name: input.trim(), details: "" };
  };

  // Handlers for Last Holiday Places (Step 6)
  const handleAddLastHolidayPlace = (e) => {
    if (e.key === 'Enter' && currentLastHolidayPlaceInput.trim() !== '') {
      const { name, details } = parsePlaceInput(currentLastHolidayPlaceInput);
      setLastHolidayPlaces(prev => [...prev, { id: Date.now(), name, details }]);
      setCurrentLastHolidayPlaceInput("");
      setLastHolidaySuggestions([]);
    }
  };

  const handleRemoveLastHolidayPlace = (id) => {
    setLastHolidayPlaces(prev => prev.filter(place => place.id !== id));
  };

  const handleLastHolidaySuggestionClick = (suggestion) => {
    setCurrentLastHolidayPlaceInput(suggestion);
    setLastHolidaySuggestions([]);
  };

  // Handlers for Favourite Places to Go (Step 7)
  const handleAddFavouritePlaceToGo = (e) => {
    if (e.key === 'Enter' && currentFavouritePlaceToGoInput.trim() !== '') {
      const { name, details } = parsePlaceInput(currentFavouritePlaceToGoInput);
      setFavouritePlacesToGo(prev => [...prev, { id: Date.now(), name, details }]);
      setCurrentFavouritePlaceToGoInput("");
      setFavouritePlaceSuggestions([]);
    }
  };

  const handleRemoveFavouritePlaceToGo = (id) => {
    setFavouritePlacesToGo(prev => prev.filter(place => place.id !== id));
  };

  const handleFavouritePlaceSuggestionClick = (suggestion) => {
    setCurrentFavouritePlaceToGoInput(suggestion);
    setFavouritePlaceSuggestions([]);
  };

  // Validation for each step's input fields
  const isStepOneValid = firstName.trim() && lastName.trim();
  const isStepTwoValid = gender && (gender !== "Other" || customGender.trim());
  const isStepThreeValid = useMemo(() => {
    if (!dob) return false;
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    return age >= 30;
  }, [dob]);
  const isStepFourValid = currentLocation.trim();
  const isStepFiveValid = favouriteTravelDestination.trim();
  const isStepSixValid = lastHolidayPlaces.length >= 3;
  const isStepSevenValid = favouritePlacesToGo.length >= 3;
  const isStepEightValid = !!profilePicUrl;

  const getNextButtonDisabled = () => {
    switch (step) {
      case 1: return !isStepOneValid;
      case 2: return !isStepTwoValid;
      case 3: return !isStepThreeValid;
      case 4: return !isStepFourValid;
      case 5: return !isStepFiveValid;
      case 6: return !isStepSixValid;
      case 7: return !isStepSevenValid;
      case 8: return !isStepEightValid;
      default: return true;
    }
  };

  const getNextButtonText = () => {
    return "Next";
  };

  // Remove VerificationPopup component

  // Profile picture upload handlers
  const handlePicInput = async (e) => {
    setPicError("");
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(file);
    setUploadingPic(true);
    try {
      const result = await uploadAPI.uploadProfilePicture(file);
      setProfilePicUrl(result.url);
    } catch (err) {
      setPicError("Failed to upload image. Please try again.");
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <div className="h-screen bg-white px-6 pt-10 flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center"
        >
          <img src="/backarrow.svg" alt="Back" width={24} height={24} />
        </button>
        <div className="text-gray-400 text-[14px] font-semibold mx-auto">
          ThursDate.
        </div>
        <div style={{ width: 24 }}></div>
      </div>

      {/* Top Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-[#222222] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step 1: Name Details */}
      {step === 1 && (
        <>
          <h1 className="text-xl font-semibold mb-4">Let's start with your Full name.</h1>
          <label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1">First Name</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-6"
          />
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            }`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 2: Gender Details */}
      {step === 2 && (
        <>
          <h1 className="text-xl font-semibold mb-6">
            Which gender best describes you?
          </h1>
          {[
            "Woman",
            "Man",
            "Non-binary",
            "Other",
          ].map((option) => (
            <label
              key={option}
              className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 mb-3 cursor-pointer"
            >
              <span>{option}</span>
              <input
                type="radio"
                name="gender"
                value={option}
                checked={gender === option}
                onChange={() => {
                  setGender(option);
                  // Only show the "Other" specific options if "Other" is selected
                  setShowOtherOptions(option === "Other");
                  // Clear customGender if "Other" is deselected
                  if (option !== "Other") {
                    setCustomGender("");
                  }
                }}
                className="accent-[#222222]"
              />
            </label>
          ))}

          {/* Display other gender options when 'Other' is selected */}
          {showOtherOptions && (
            <div className="border border-gray-200 rounded-lg p-4 mt-3">
              <p className="text-sm font-semibold mb-3">Please specify:</p>
              {[
                "Non-Binary", // This seems to be duplicated from the main options, but keeping it as per image
                "Genderqueer",
                "Agender",
                "Bigender",
                "Genderfluid",
                "Transgender",
                "Transmasculine",
                "Transfeminine",
                "Two-Spirit",
                "Intersex",
                "Demiboy",
                "Demigirl",
                "Third Gender",
              ].map((otherOption) => (
                <label
                  key={otherOption}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <span>{otherOption}</span>
                  <input
                    type="radio"
                    name="customGenderOption" // Use a different name for the nested radio buttons
                    value={otherOption}
                    checked={customGender === otherOption}
                    onChange={() => setCustomGender(otherOption)}
                    className="accent-[#222222]"
                  />
                </label>
              ))}
            </div>
          )}

          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 mb-5 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            } mt-4`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 3: Age Details */}
      {step === 3 && (
        <>
          <h1 className="text-xl font-semibold mb-6">What's your Age?</h1>
          <div
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm mb-2 flex justify-between items-center cursor-pointer"
            onClick={() => {
              setShowDatePicker(true);
            }}
          >
            {dob ? new Date(dob).toLocaleDateString('en-GB') : "DD/MM/YYYY"}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Must be at least 30 years old
          </p>
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            }`}
          >
            {getNextButtonText()}
          </button>

          {/* Custom Date Picker Overlay */}
          {showDatePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
              <div className="w-full bg-white p-4 rounded-t-xl shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setShowDatePicker(false)} className="text-blue-500">Cancel</button>
                  <div className="font-semibold">Select Date</div>
                  <button onClick={handleDateConfirm} className="text-blue-500 font-semibold">Done</button>
                </div>

                <WheelPickerWrapper
                  className="flex w-full justify-center h-48 py-2 relative"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.05) 50%, transparent)',
                    backgroundSize: '100% 2px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  <WheelPicker
                    options={dayOptions}
                    value={pickerDay}
                    onValueChange={(val) => setPickerDay(updatePickerDayBasedOnMonthYear(pickerYear, pickerMonth, val))}
                    classNames={{
                      optionItem: "text-gray-400",
                      highlightWrapper: "bg-gray-100 rounded-md",
                      highlightItem: "text-gray-800 font-semibold",
                    }}
                    infinite={true}
                  />
                  <WheelPicker
                    options={monthOptions}
                    value={pickerMonth}
                    onValueChange={(val) => {
                      setPickerMonth(val);
                      setPickerDay(updatePickerDayBasedOnMonthYear(pickerYear, val, pickerDay));
                    }}
                    classNames={{
                      optionItem: "text-gray-400",
                      highlightWrapper: "bg-gray-100 rounded-md",
                      highlightItem: "text-gray-800 font-semibold",
                    }}
                    infinite={true}
                  />
                  <WheelPicker
                    options={yearOptions}
                    value={pickerYear}
                    onValueChange={(val) => {
                      setPickerYear(val);
                      setPickerDay(updatePickerDayBasedOnMonthYear(val, pickerMonth, pickerDay));
                    }}
                    classNames={{
                      optionItem: "text-gray-400",
                      highlightWrapper: "bg-gray-100 rounded-md",
                      highlightItem: "text-gray-800 font-semibold",
                    }}
                    infinite={false}
                  />
                </WheelPickerWrapper>
              </div>
            </div>
          )}
        </>
      )}

      {/* Step 4: Current Location Details */}
      {step === 4 && (
        <>
          <h1 className="text-xl font-semibold mb-4">Where are you living currently?</h1>
          <p className="text-sm text-gray-500 mb-6">This will help users see which city you are currently living in so they can connect accordingly.</p>
          <div className="relative mb-6">
            <input
              type="text"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="Andheri"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm pr-10"
            />
            {currentLocation && (
              <button
                onClick={() => setCurrentLocation("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                ×
              </button>
            )}
          </div>

          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            }`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 5: Favourite Travel Destination */}
      {step === 5 && (
        <>
          <h1 className="text-xl font-semibold mb-4">What is your favourite travel destination?</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your dream destination</p>
          <div className="relative mb-6">
            <input
              type="text"
              value={favouriteTravelDestination}
              onChange={(e) => setFavouriteTravelDestination(e.target.value)}
              placeholder="e.g., Paris"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm pr-10"
            />
            {favouriteTravelDestination && (
              <button
                onClick={() => setFavouriteTravelDestination("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                ×
              </button>
            )}
          </div>
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            }`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 6: Last Holiday Places - Tag Input with Autocomplete */}
      {step === 6 && (
        <>
          <h1 className="text-xl font-semibold mb-4">Where did you go on your last holiday?</h1>
          <p className="text-sm text-gray-500 mb-6">Enter minimum 3 places</p>

          {/* Display existing tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lastHolidayPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-[#222222] text-white px-3 py-2 rounded-lg flex items-center text-sm"
              >
                <span>{place.name}</span>
                {place.details && (
                  <span className="text-gray-300 ml-1 text-xs">({place.details})</span>
                )}
                <button
                  onClick={() => handleRemoveLastHolidayPlace(place.id)}
                  className="ml-2 text-white opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Input for new tags with autocomplete */}
          <div className="relative mb-6">
            <input
              type="text"
              value={currentLastHolidayPlaceInput}
              onChange={(e) => setCurrentLastHolidayPlaceInput(e.target.value)}
              onKeyDown={handleAddLastHolidayPlace}
              placeholder="Type a place & press Enter (e.g., Paris)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm pr-10"
            />
            {currentLastHolidayPlaceInput && (
              <button
                onClick={() => {
                  setCurrentLastHolidayPlaceInput("");
                  setLastHolidaySuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                ×
              </button>
            )}
            {lastHolidaySuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                {lastHolidaySuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleLastHolidaySuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            } mt-2`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 7: Favourite Places to Go To - Tag Input with Autocomplete */}
      {step === 7 && (
        <>
          <h1 className="text-xl font-semibold mb-4">What are your three favourite places to go to?</h1>
          <p className="text-sm text-gray-500 mb-6">Enter minimum 3 places</p>

          {/* Display existing tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {favouritePlacesToGo.map((place) => (
              <div
                key={place.id}
                className="bg-[#222222] text-white px-3 py-2 rounded-lg flex items-center text-sm"
              >
                <span>{place.name}</span>
                {place.details && (
                  <span className="text-gray-300 ml-1 text-xs">({place.details})</span>
                )}
                <button
                  onClick={() => handleRemoveFavouritePlaceToGo(place.id)}
                  className="ml-2 text-white opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Input for new tags with autocomplete */}
          <div className="relative mb-6">
            <input
              type="text"
              value={currentFavouritePlaceToGoInput}
              onChange={(e) => setCurrentFavouritePlaceToGoInput(e.target.value)}
              onKeyDown={handleAddFavouritePlaceToGo}
              placeholder="Type a place & press Enter (e.g., Paris)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm pr-10"
            />
            {currentFavouritePlaceToGoInput && (
              <button
                onClick={() => {
                  setCurrentFavouritePlaceToGoInput("");
                  setFavouritePlaceSuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                ×
              </button>
            )}
            {favouritePlaceSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto">
                {favouritePlaceSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleFavouritePlaceSuggestionClick (suggestion)}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            } mt-2`}
          >
            {getNextButtonText()}
          </button>
        </>
      )}

      {/* Step 8: Profile Picture Upload */}
      {step === 8 && (
        <>
          <h1 className="text-xl font-semibold mb-2">Face Verification</h1>
          <p className="text-sm text-gray-500 mb-6">Upload a clear face photo.<br/>This won’t appear on your profile—it’s just to keep our community safe.</p>
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4 border-2 border-gray-200 relative cursor-pointer"
              onClick={() => setShowPicModal(true)}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile Preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-4xl text-gray-400">+</span>
              )}
              {uploadingPic && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Uploading...</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 text-center">
              <div className="mb-2 font-semibold">Pro Tip:</div>
              <ul className="list-disc list-inside text-xs text-gray-400 text-left">
                <li>Use a well-lit background</li>
                <li>Look straight at the camera</li>
                <li>No sunglasses or masks</li>
              </ul>
            </div>
            {picError && <div className="text-red-500 text-xs mt-2">{picError}</div>}
          </div>
          <button
            disabled={getNextButtonDisabled()}
            onClick={handleNext}
            className={`w-full py-4 rounded-xl text-white font-medium text-sm ${
              getNextButtonDisabled() ? "bg-gray-300 cursor-not-allowed" : "bg-[#222222]"
            }`}
          >
            Next
          </button>

          {/* Modal for Gallery/Camera selection */}
          {showPicModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end justify-center z-50">
              <div className="w-full bg-white rounded-t-2xl p-6 pb-8 shadow-lg">
                <div className="mb-4 text-center font-semibold">Upload a profile picture</div>
                <div className="flex flex-col gap-3">
                  <label className="w-full py-3 rounded-xl bg-gray-100 text-center cursor-pointer text-sm font-medium">
                    Gallery
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        setShowPicModal(false);
                        handlePicInput(e);
                      }}
                    />
                  </label>
                  <label className="w-full py-3 rounded-xl bg-gray-100 text-center cursor-pointer text-sm font-medium">
                    Camera
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        setShowPicModal(false);
                        handlePicInput(e);
                      }}
                    />
                  </label>
                </div>
                <button
                  className="w-full mt-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-medium"
                  onClick={() => setShowPicModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}