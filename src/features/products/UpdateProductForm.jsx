import { useEffect } from "react";
import { useController, useForm } from "react-hook-form";

import {
  PRODUCT_STATUSES,
  PRODUCT_STATES,
  PRODUCT_TYPES,
  S3_STORAGE_URL,
} from "@/utils/constants";
import { getBrandsForSelect } from "@/services/apiBrands";
import { useCurrentUserContext } from "@/contexts/CurrentUserContext";
import { useUpdateProduct } from "./useUpdateProduct";

import Button from "@/ui/Button";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Textarea from "@/ui/Textarea";
import Select from "@/ui/Select";
import Checkbox from "@/ui/Checkbox";
import ImageUploader from "@/ui/ImageUploader";

import CreateBrandForm from "@/features/brands/CreateBrandForm";

function UpdateProductForm({ productToUpdate, onCloseModal }) {
  const { id: updateId, ...updateValues } = productToUpdate;
  const { isUpdating, updateProduct } = useUpdateProduct();
  const { hasAccess } = useCurrentUserContext();
  const { register, formState, handleSubmit, reset, control, watch, setValue } =
    useForm({
      defaultValues: {
        ...updateValues,
        brand_id: productToUpdate.brand?.id || null,
      },
    });
  const { errors } = formState;

  const { field: brandField } = useController({
    name: "brand_id",
    control,
    defaultValue: productToUpdate.brand?.id || null,
  });
  const { field: stateField } = useController({
    name: "state",
    control,
    rules: { required: "Ce champ est obligatoire" },
  });
  const { field: statusField } = useController({
    name: "status",
    control,
    rules: { required: "Ce champ est obligatoire" },
  });
  const { field: productTypeField } = useController({
    name: "product_type",
    control,
    rules: { required: "Ce champ est obligatoire" },
  });

  // "Cosmétique à vérif" is not a vegan verdict - force the status to MAYBE_VEGAN
  // and lock the field while that state is selected.
  const isStatusLocked = watch("state") === "TO_INVESTIGATE";

  useEffect(() => {
    if (isStatusLocked && statusField.value !== "MAYBE_VEGAN") {
      setValue("status", "MAYBE_VEGAN");
    }
  }, [isStatusLocked, statusField.value, setValue]);
  const { field: isByodinamicField } = useController({
    name: "biodynamic",
    control,
    defaultValue: updateValues.biodynamic,
  });
  const { field: hasNonVeganOldReceipeField } = useController({
    name: "has_non_vegan_old_receipe",
    control,
    defaultValue: updateValues.has_non_vegan_old_receipe,
  });
  const { field: imageField } = useController({
    name: "image",
    control,
    defaultValue: productToUpdate.image || null,
  });

  function onSubmit(data) {
    if (data.state === "TO_INVESTIGATE") data.status = "MAYBE_VEGAN";
    updateProduct(
      { newData: data, id: updateId },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  }

  return (
    <Form type={onCloseModal ? "modal" : "regular"}>
      <FormRow label="État" error={errors.state?.message}>
        <Select
          name="state"
          onChange={stateField.onChange}
          isSearchable={true}
          defaultValue={[stateField.value]}
          defaultOptions={Object.entries(PRODUCT_STATES).map(([key, o]) => {
            return {
              value: key,
              label: o.label,
              disabled: hasAccess(o.role) ? false : true,
            };
          })}
          required={true}
          disabled={isUpdating}
        />
      </FormRow>
      <FormRow label="Statut" error={errors.status?.message}>
        <Select
          key={isStatusLocked ? "status-locked" : "status"}
          name="status"
          onChange={statusField.onChange}
          isSearchable={true}
          defaultValue={[isStatusLocked ? "MAYBE_VEGAN" : statusField.value]}
          defaultOptions={Object.entries(PRODUCT_STATUSES).map(([key, o]) => {
            return { value: key, label: o.label };
          })}
          required={true}
          disabled={isUpdating || isStatusLocked}
        />
      </FormRow>
      <FormRow label="Type" error={errors.product_type?.message}>
        <Select
          name="product_type"
          onChange={productTypeField.onChange}
          isSearchable={true}
          defaultValue={[productTypeField.value]}
          defaultOptions={Object.entries(PRODUCT_TYPES).map(([key, o]) => {
            return { value: key, label: o.label };
          })}
          required={true}
          disabled={isUpdating}
        />
      </FormRow>
      <FormRow label="Marque" error={errors.brand_id?.message}>
        <Select
          name="brand_id"
          onChange={brandField.onChange}
          defaultOptions={
            productToUpdate.brand
              ? [
                  {
                    value: productToUpdate.brand.id,
                    label: productToUpdate.brand.name,
                  },
                ]
              : []
          }
          defaultValue={[brandField.value]}
          getOptions={getBrandsForSelect}
          required={false}
          disabled={isUpdating}
          isSearchable={true}
          isNullable={true}
          createComponent={<CreateBrandForm />}
        />
      </FormRow>

      <FormRow label="EAN" error={errors.ean?.message}>
        <Input
          type="text"
          id="ean"
          {...register("ean", { required: "Ce champ est obligatoire" })}
          disabled={true}
          readOnly={true}
          required
        />
      </FormRow>

      <FormRow label="Dénomination" error={errors.name?.message}>
        <Input
          type="text"
          id="name"
          {...register("name")}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Description" error={errors.description?.message}>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Problèmes" error={errors.problem_description?.message}>
        <Textarea
          id="problem_description"
          {...register("problem_description")}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Biodynamie ?" error={errors.biodynamic?.message}>
        <Checkbox
          name="biodynamic"
          onChange={isByodinamicField.onChange}
          onBlur={isByodinamicField.onBlur}
          checked={isByodinamicField.value}
          value={isByodinamicField.value}
          $inputRef={isByodinamicField.ref}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow
        label="Ancienne recette non vegan ?"
        error={errors.has_non_vegan_old_receipe?.message}
      >
        <Checkbox
          name="has_non_vegan_old_receipe"
          onChange={hasNonVeganOldReceipeField.onChange}
          onBlur={hasNonVeganOldReceipeField.onBlur}
          checked={hasNonVeganOldReceipeField.value}
          value={hasNonVeganOldReceipeField.value}
          $inputRef={hasNonVeganOldReceipeField.ref}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Image" error={errors.image?.message}>
        <ImageUploader
          id="image"
          onUpload={imageField.onChange}
          disabled={isUpdating}
          defaultValue={imageField.value}
          previewBaseUrl={S3_STORAGE_URL}
        />
      </FormRow>

      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isUpdating}
        >
          Annuler
        </Button>
        <Button disabled={isUpdating} onClick={handleSubmit(onSubmit)}>
          Modifier
        </Button>
      </FormRow>
    </Form>
  );
}

export default UpdateProductForm;
