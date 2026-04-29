import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchSystemSetting,
  upsertSystemSetting,
} from "../model/settingsService";
import { useEnumViewModel } from "@/modules/enums/viewModel/useEnumViewModel";
import { EnumCategory } from "@/modules/enums/types/enum.schemas";
import { toastService } from "@/core/toast/toastService";

export const SETTING_KEYS = {
  ACADEMIC_YEAR: "CURRENT_ACADEMIC_YEAR_ID",
};

export const useSystemSettingsViewModel = () => {
  const queryClient = useQueryClient();

  const [selectedYearId, setSelectedYearId] = useState<string | undefined>(
    undefined,
  );

  //  Fetch the Dropdown Options (Academic Years from Enums)
  const { enums: academicYears, isLoading: isEnumsLoading } = useEnumViewModel(
    EnumCategory.ACADEMIC_YEAR,
  );

  const academicYearOptions =
    academicYears?.map((year) => ({
      id: year.id,
      label: year.value,
    })) || [];

  //  Fetch the Current Active Setting from the DB
  const { data: currentSetting, isLoading: isSettingLoading } = useQuery({
    queryKey: ["system-setting", SETTING_KEYS.ACADEMIC_YEAR],
    queryFn: () => fetchSystemSetting(SETTING_KEYS.ACADEMIC_YEAR),
  });

  //  Sync the fetched setting into our local React state
  useEffect(() => {
    if (currentSetting?.value) {
      setSelectedYearId(currentSetting.value);
    }
  }, [currentSetting]);

  //  Handle the Save Mutation
  const { mutate: saveSetting, isPending: isSaving } = useMutation({
    mutationFn: (newYearIdString: string) =>
      upsertSystemSetting({
        key: SETTING_KEYS.ACADEMIC_YEAR,
        value: newYearIdString,
        description: "The currently active academic year for the system",
      }),
    onSuccess: () => {
      toastService.success(
        "The active academic year has been changed successfully.",
      );
      // Invalidate cache so any other component relying on this updates instantly
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
    },
    onError: (error: any) => {
      toastService.error(
        error?.response?.data?.message || "Something went wrong.",
      );
    },
  });

  const onSave = () => {
    if (!selectedYearId) {
      toastService.warning("Please select an academic year before saving.");
      return;
    }
    saveSetting(String(selectedYearId));
  };

  const hasChanges = currentSetting?.value !== selectedYearId;

  return {
    academicYearOptions,
    selectedYearId,
    setSelectedYearId,
    onSave,
    isSaving,
    hasChanges,
    isLoading: isEnumsLoading || isSettingLoading,
  };
};
