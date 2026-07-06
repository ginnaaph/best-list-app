import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScoreSlider } from "@/components/score-slider";
import { colors } from "@/constants/theme";

const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ??
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

type PlacesAutocompleteType = "establishment" | "(cities)";

type PlacePrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type PlacesAutocompleteResponse = {
  predictions?: PlacePrediction[];
  status: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceDetailsResponse = {
  result?: {
    address_components?: AddressComponent[];
  };
  status: string;
};

export type EntryFormValues = {
  placeName: string;
  city: string;
  taste: number;
  value: number;
  portion: number;
  vibe: number;
  notes?: string;
  photoUrl?: string;
};

type EntryFormProps = {
  initialValues: EntryFormValues;
  saveLabel: string;
  saving: boolean;
  onSave: (values: EntryFormValues) => void;
  onDelete?: () => void;
};

function TextField({
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
        {label}
      </Text>
      <TextInput
        className={`rounded-xl border border-subtle bg-white pt-2 pb-2 mt-1 px-4 font-body text-[15px] text-primary ${
          multiline ? "py-3" : "h-11"
        }`}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        returnKeyType={multiline ? "default" : "next"}
      />
    </View>
  );
}

function getAutocompleteUrl(input: string, type: PlacesAutocompleteType) {
  const params = [
    `input=${encodeURIComponent(input)}`,
    `types=${encodeURIComponent(type)}`,
    `key=${encodeURIComponent(GOOGLE_PLACES_API_KEY ?? "")}`,
  ];

  return `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.join(
    "&",
  )}`;
}

function getPlaceDetailsUrl(placeId: string) {
  const params = [
    `place_id=${encodeURIComponent(placeId)}`,
    "fields=address_components",
    `key=${encodeURIComponent(GOOGLE_PLACES_API_KEY ?? "")}`,
  ];

  return `https://maps.googleapis.com/maps/api/place/details/json?${params.join(
    "&",
  )}`;
}

function getPredictionMainText(prediction: PlacePrediction) {
  return prediction.structured_formatting?.main_text ?? prediction.description;
}

function getPredictionSecondaryText(prediction: PlacePrediction) {
  return prediction.structured_formatting?.secondary_text ?? "";
}

function getAddressComponent(
  components: AddressComponent[],
  type: string,
  name: "long_name" | "short_name" = "long_name",
) {
  return components.find((component) => component.types.includes(type))?.[name];
}

function getCityFromAddressComponents(components: AddressComponent[]) {
  const locality =
    getAddressComponent(components, "locality") ??
    getAddressComponent(components, "postal_town") ??
    getAddressComponent(components, "administrative_area_level_2");
  const state = getAddressComponent(
    components,
    "administrative_area_level_1",
    "short_name",
  );

  return [locality, state].filter(Boolean).join(", ");
}

function getCityFallbackFromPrediction(prediction: PlacePrediction) {
  const mainText = getPredictionMainText(prediction);
  const secondaryText = getPredictionSecondaryText(prediction);
  const state = secondaryText.split(",")[0]?.trim();

  return [mainText, state].filter(Boolean).join(", ");
}

export function EntryForm({
  initialValues,
  saveLabel,
  saving,
  onSave,
  onDelete,
}: EntryFormProps) {
  const [placeName, setPlaceName] = useState(initialValues.placeName);
  const [city, setCity] = useState(initialValues.city);
  const [taste, setTaste] = useState(initialValues.taste);
  const [value, setValue] = useState(initialValues.value);
  const [portion, setPortion] = useState(initialValues.portion);
  const [vibe, setVibe] = useState(initialValues.vibe);
  const [notes, setNotes] = useState(initialValues.notes ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    initialValues.photoUrl,
  );
  const [placeSuggestions, setPlaceSuggestions] = useState<PlacePrediction[]>(
    [],
  );
  const [citySuggestions, setCitySuggestions] = useState<PlacePrediction[]>([]);
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const [isSelectingCity, setIsSelectingCity] = useState(false);
  const [hasEditedPlace, setHasEditedPlace] = useState(false);
  const [hasEditedCity, setHasEditedCity] = useState(false);
  const autocompleteRequestIdRef = useRef(0);
  const cityAutocompleteRequestIdRef = useRef(0);
  const placeDetailsRequestIdRef = useRef(0);

  useEffect(() => {
    if (!hasEditedPlace || isSelectingPlace) {
      return;
    }

    const requestId = autocompleteRequestIdRef.current + 1;
    autocompleteRequestIdRef.current = requestId;
    const trimmedPlaceName = placeName.trim();

    if (!GOOGLE_PLACES_API_KEY || trimmedPlaceName.length < 2) {
      setPlaceSuggestions([]);
      setShowPlaceSuggestions(false);
      return;
    }

    let isActive = true;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          getAutocompleteUrl(trimmedPlaceName, "establishment"),
        );

        if (!response.ok) {
          throw new Error("Place autocomplete request failed.");
        }

        const data = (await response.json()) as PlacesAutocompleteResponse;

        if (!isActive || autocompleteRequestIdRef.current !== requestId) {
          return;
        }

        if (data.status !== "OK") {
          setPlaceSuggestions([]);
          setShowPlaceSuggestions(false);
          return;
        }

        const predictions = data.predictions ?? [];
        setPlaceSuggestions(predictions);
        setShowPlaceSuggestions(predictions.length > 0);
      } catch {
        if (isActive && autocompleteRequestIdRef.current === requestId) {
          setPlaceSuggestions([]);
          setShowPlaceSuggestions(false);
        }
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [hasEditedPlace, isSelectingPlace, placeName]);

  useEffect(() => {
    if (!hasEditedCity || isSelectingCity) {
      return;
    }

    const requestId = cityAutocompleteRequestIdRef.current + 1;
    cityAutocompleteRequestIdRef.current = requestId;
    const trimmedCity = city.trim();

    if (!GOOGLE_PLACES_API_KEY || trimmedCity.length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    let isActive = true;

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(getAutocompleteUrl(trimmedCity, "(cities)"));

        if (!response.ok) {
          throw new Error("City autocomplete request failed.");
        }

        const data = (await response.json()) as PlacesAutocompleteResponse;

        if (!isActive || cityAutocompleteRequestIdRef.current !== requestId) {
          return;
        }

        if (data.status !== "OK") {
          setCitySuggestions([]);
          setShowCitySuggestions(false);
          return;
        }

        const predictions = data.predictions ?? [];
        setCitySuggestions(predictions);
        setShowCitySuggestions(predictions.length > 0);
      } catch {
        if (isActive && cityAutocompleteRequestIdRef.current === requestId) {
          setCitySuggestions([]);
          setShowCitySuggestions(false);
        }
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [city, hasEditedCity, isSelectingCity]);

  const handlePlaceNameChange = (nextPlaceName: string) => {
    placeDetailsRequestIdRef.current += 1;
    setHasEditedPlace(true);
    setIsSelectingPlace(false);
    setPlaceName(nextPlaceName);
  };

  const handleCityChange = (nextCity: string) => {
    setHasEditedCity(true);
    setIsSelectingCity(false);
    setCity(nextCity);
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    const placeDetailsRequestId = placeDetailsRequestIdRef.current + 1;
    placeDetailsRequestIdRef.current = placeDetailsRequestId;
    const selectedPlaceName = getPredictionMainText(prediction);

    autocompleteRequestIdRef.current += 1;
    setIsSelectingPlace(true);
    setPlaceName(selectedPlaceName);
    setPlaceSuggestions([]);
    setShowPlaceSuggestions(false);

    if (!GOOGLE_PLACES_API_KEY) {
      return;
    }

    try {
      const response = await fetch(getPlaceDetailsUrl(prediction.place_id));

      if (!response.ok) {
        throw new Error("Place details request failed.");
      }

      const data = (await response.json()) as PlaceDetailsResponse;
      const addressComponents = data.result?.address_components ?? [];
      const selectedCity = getCityFromAddressComponents(addressComponents);

      if (placeDetailsRequestIdRef.current !== placeDetailsRequestId) {
        return;
      }

      cityAutocompleteRequestIdRef.current += 1;
      setIsSelectingCity(true);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setCity(selectedCity || "");
    } catch {
      if (placeDetailsRequestIdRef.current !== placeDetailsRequestId) {
        return;
      }

      cityAutocompleteRequestIdRef.current += 1;
      setIsSelectingCity(true);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setCity("");
      return;
    }
  };

  const handleSelectCity = async (prediction: PlacePrediction) => {
    const fallbackCity = getCityFallbackFromPrediction(prediction);

    cityAutocompleteRequestIdRef.current += 1;
    setIsSelectingCity(true);
    setCity(fallbackCity);
    setCitySuggestions([]);
    setShowCitySuggestions(false);

    if (!GOOGLE_PLACES_API_KEY) {
      return;
    }

    try {
      const response = await fetch(getPlaceDetailsUrl(prediction.place_id));

      if (!response.ok) {
        throw new Error("City details request failed.");
      }

      const data = (await response.json()) as PlaceDetailsResponse;
      const addressComponents = data.result?.address_components ?? [];
      const selectedCity = getCityFromAddressComponents(addressComponents);

      if (selectedCity) {
        setCity(selectedCity);
      }
    } catch {
      return;
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Camera access needed",
        "Please allow camera access to take an entry photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0]?.uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Please allow photo access to add an entry photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0]?.uri);
    }
  };

  const handlePickPhoto = () => {
    Alert.alert("Add Photo", undefined, [
      { text: "Take Photo", onPress: () => void handleTakePhoto() },
      {
        text: "Choose from Library",
        onPress: () => void handleChooseFromLibrary(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    onSave({
      placeName,
      city,
      taste,
      value,
      portion,
      vibe,
      notes,
      photoUrl,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4 pb-10 pt-4">
          <View className="gap-2">
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-secondary">
              Photo (optional)
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={photoUrl ? "Change photo" : "Add photo"}
              onPress={handlePickPhoto}
            >
              {photoUrl ? (
                <Image
                  className="aspect-square w-full rounded-bestlist-xl bg-white"
                  source={{ uri: photoUrl }}
                />
              ) : (
                <View className="aspect-square w-full items-center justify-center rounded-bestlist-xl border border-dashed border-subtle bg-white gap-2">
                  <Text className="text-3xl">📷</Text>
                  <Text className="font-body text-[14px] text-secondary">
                    Tap to add a photo
                  </Text>
                </View>
              )}
            </Pressable>

            {photoUrl ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                className="h-11 items-center justify-center rounded-full border border-subtle bg-white px-4"
                onPress={() => setPhotoUrl(undefined)}
              >
                <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                  Remove Photo
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="gap-1.5">
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
              Place Name
            </Text>
            <TextInput
              className="mt-1 h-11 rounded-xl border border-subtle bg-white px-4 pt-2 pb-2 font-body text-[15px] text-primary"
              placeholder="e.g. Nopalito"
              placeholderTextColor={colors.secondaryText}
              value={placeName}
              onChangeText={handlePlaceNameChange}
              onFocus={() => {
                if (placeSuggestions.length > 0) {
                  setShowPlaceSuggestions(true);
                }
              }}
              returnKeyType="next"
            />

            {showPlaceSuggestions ? (
              <View className="overflow-hidden rounded-xl border border-subtle bg-white">
                {placeSuggestions.map((suggestion, index) => {
                  const mainText = getPredictionMainText(suggestion);
                  const secondaryText = getPredictionSecondaryText(suggestion);
                  const isLastSuggestion =
                    index === placeSuggestions.length - 1;

                  return (
                    <Pressable
                      key={suggestion.place_id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${mainText}`}
                      className={`px-4 py-3 ${
                        isLastSuggestion ? "" : "border-b border-subtle"
                      }`}
                      onPress={() => handleSelectPlace(suggestion)}
                    >
                      <Text className="font-body text-[15px] font-semibold text-primary">
                        {mainText}
                      </Text>
                      {secondaryText ? (
                        <Text className="mt-0.5 font-body text-[13px] text-secondary">
                          {secondaryText}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View className="gap-1.5">
            <Text className="font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
              City
            </Text>
            <TextInput
              className="mt-1 h-11 rounded-xl border border-subtle bg-white px-4 pt-2 pb-2 font-body text-[15px] text-primary"
              placeholder="e.g. San Francisco, CA"
              placeholderTextColor={colors.secondaryText}
              value={city}
              onChangeText={handleCityChange}
              onFocus={() => {
                if (citySuggestions.length > 0) {
                  setShowCitySuggestions(true);
                }
              }}
              returnKeyType="next"
            />

            {showCitySuggestions ? (
              <View className="overflow-hidden rounded-xl border border-subtle bg-white">
                {citySuggestions.map((suggestion, index) => {
                  const mainText = getPredictionMainText(suggestion);
                  const secondaryText = getPredictionSecondaryText(suggestion);
                  const isLastSuggestion =
                    index === citySuggestions.length - 1;

                  return (
                    <Pressable
                      key={suggestion.place_id}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${mainText}`}
                      className={`px-4 py-3 ${
                        isLastSuggestion ? "" : "border-b border-subtle"
                      }`}
                      onPress={() => handleSelectCity(suggestion)}
                    >
                      <Text className="font-body text-[15px] font-semibold text-primary">
                        {mainText}
                      </Text>
                      {secondaryText ? (
                        <Text className="mt-0.5 font-body text-[13px] text-secondary">
                          {secondaryText}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View className="rounded-2xl bg-white p-4 shadow-card">
            <Text className="mb-3 font-mono-bestlist text-[10px] font-bold uppercase tracking-[1.5px] text-accent">
              Scores
            </Text>
            <View className="gap-3">
              <ScoreSlider label="Taste" value={taste} onChange={setTaste} />
              <ScoreSlider label="Value" value={value} onChange={setValue} />
              <ScoreSlider
                label="Portion"
                value={portion}
                onChange={setPortion}
              />
              <ScoreSlider label="Vibe" value={vibe} onChange={setVibe} />
            </View>
          </View>

          <TextField
            label="Note (optional)"
            placeholder="Anything worth remembering..."
            value={notes}
            onChange={setNotes}
            multiline
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saveLabel}
            className="mt-2 h-13 items-center justify-center rounded-full bg-accent shadow-card"
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-white">
              {saveLabel}
            </Text>
          </Pressable>

          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete entry"
              className="h-13 items-center justify-center rounded-full border border-subtle bg-white"
              onPress={onDelete}
              disabled={saving}
            >
              <Text className="font-body text-[15px] font-bold uppercase tracking-[1px] text-accent">
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
