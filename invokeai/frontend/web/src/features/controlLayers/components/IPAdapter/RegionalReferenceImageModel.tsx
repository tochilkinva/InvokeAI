import { Combobox, FormControl, Tooltip } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { useGroupedModelCombobox } from 'common/hooks/useGroupedModelCombobox';
import { selectBase } from 'features/controlLayers/store/paramsSlice';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegionalReferenceImageModels } from 'services/api/hooks/modelsByType';
import type { AnyModelConfig, FLUXReduxModelConfig, IPAdapterModelConfig } from 'services/api/types';

type Props = {
  modelKey: string | null;
  onChangeModel: (modelConfig: IPAdapterModelConfig | FLUXReduxModelConfig) => void;
};

const filter = (config: IPAdapterModelConfig | FLUXReduxModelConfig) => {
  // FLUX supports regional guidance for FLUX Redux models only - not IP Adapter models.
  if (config.base === 'flux' && config.type === 'ip_adapter') {
    return false;
  }
  return true;
};

export const RegionalReferenceImageModel = memo(({ modelKey, onChangeModel }: Props) => {
  const { t } = useTranslation();
  const currentBaseModel = useAppSelector(selectBase);
  const [modelConfigs, { isLoading }] = useRegionalReferenceImageModels(filter);
  const selectedModel = useMemo(() => modelConfigs.find((m) => m.key === modelKey), [modelConfigs, modelKey]);

  const _onChangeModel = useCallback(
    (modelConfig: IPAdapterModelConfig | FLUXReduxModelConfig | null) => {
      if (!modelConfig) {
        return;
      }
      onChangeModel(modelConfig);
    },
    [onChangeModel]
  );

  const getIsDisabled = useCallback(
    (model: AnyModelConfig): boolean => {
      const hasMainModel = Boolean(currentBaseModel);
      const hasSameBase = currentBaseModel === model.base;
      return !hasMainModel || !hasSameBase;
    },
    [currentBaseModel]
  );

  const { options, value, onChange, noOptionsMessage } = useGroupedModelCombobox({
    modelConfigs,
    onChange: _onChangeModel,
    selectedModel,
    getIsDisabled,
    isLoading,
  });

  return (
    <Tooltip label={selectedModel?.description}>
      <FormControl isInvalid={!value || currentBaseModel !== selectedModel?.base} w="full">
        <Combobox
          options={options}
          placeholder={t('common.placeholderSelectAModel')}
          value={value}
          onChange={onChange}
          noOptionsMessage={noOptionsMessage}
        />
      </FormControl>
    </Tooltip>
  );
});

RegionalReferenceImageModel.displayName = 'RegionalReferenceImageModel';
