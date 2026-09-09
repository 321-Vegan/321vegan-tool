import { useEffect, useState } from "react";
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
import { useDeleteProduct } from "./useDeleteProduct";

import Button from "@/ui/Button";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Textarea from "@/ui/Textarea";
import Select from "@/ui/Select";
import Checkbox from "@/ui/Checkbox";
import Radios from "@/ui/Radios";
import Modal from "@/ui/Modal";
import ConfirmAction from "@/ui/ConfirmAction";
import Spinner from "@/ui/Spinner";
import ImageUploader from "@/ui/ImageUploader";

import CreateBrandForm from "@/features/brands/CreateBrandForm";
import ProblemBox from "./ProblemBox";

import styled from "styled-components";

// "Cosmétique à vérif" is set apart from the linear contact workflow.
const SeparatedState = styled.div`
  margin-left: auto;
  display: inline-flex;
`;

function RegisterProductForm({ productToCheckedIn, onClose, onSelectBrand }) {
  const { id: checkedId, ...checkedInValues } = productToCheckedIn;
  const [brands, setBrands] = useState(
    productToCheckedIn.brand
      ? [
          {
            value: productToCheckedIn.brand.id,
            label: productToCheckedIn.brand.name,
            background: productToCheckedIn.brand.background,
          },
        ]
      : [],
  );
  const { isUpdating, updateProduct } = useUpdateProduct();
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const { hasAccess } = useCurrentUserContext();

  const { register, formState, handleSubmit, reset, control, watch, setValue } =
    useForm({
      defaultValues: {
        ...checkedInValues,
        brand_id: productToCheckedIn.brand?.id || null,
      },
    });
  const { errors } = formState;

  const isPending = isUpdating || isDeleting;

  const watchFields = watch([
    "state",
    "status",
    "problem_description",
    "brand_id",
    "product_type",
  ]);
  const { field: brandField } = useController({
    name: "brand_id",
    control,
    rules: {
      required:
        watchFields[1] !== "NOT_FOUND" ? "La marque est obligatoire" : false,
    },
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
  const { field: isByodinamicField } = useController({
    name: "biodynamic",
    control,
    defaultValue: checkedInValues.biodynamic,
  });
  const { field: hasNonVeganOldReceipeField } = useController({
    name: "has_non_vegan_old_receipe",
    control,
    defaultValue: checkedInValues.has_non_vegan_old_receipe,
  });
  const { field: imageField } = useController({
    name: "image",
    control,
    defaultValue: checkedInValues.image || null,
  });

  // Show problems field only for MAYBE_VEGAN or NON_VEGAN status
  const shouldShowProblemsField = ["MAYBE_VEGAN", "NON_VEGAN"].includes(
    watchFields[1],
  );

  // Status is locked to MAYBE_VEGAN for states that are not a real
  // "is it vegan" verdict (brand contact, cosmetic to investigate).
  const isStatusLocked = ["NEED_CONTACT", "TO_INVESTIGATE"].includes(
    watchFields[0],
  );

  // Auto-set status to MAYBE_VEGAN when the state locks it
  useEffect(() => {
    if (isStatusLocked && watchFields[1] !== "MAYBE_VEGAN") {
      setValue("status", "MAYBE_VEGAN");
    }
  }, [isStatusLocked, watchFields, setValue]);

  useEffect(() => {
    onSelectBrand(brands.find((b) => b.value === watchFields[3]));
  }, [watchFields, onSelectBrand, brands]);

  async function getSearchedBrand(searchedName) {
    try {
      const searchedBrands = await getBrandsForSelect(searchedName);
      setBrands(searchedBrands.data);
      return searchedBrands;
    } catch (error) {
      setBrands([]);
      console.error(error);
    }
  }

  function onSubmit(data) {
    if (!shouldShowProblemsField) {
      data.problem_description = null;
    }
    updateProduct(
      { newData: data, id: checkedId },
      {
        onSuccess: () => {
          reset();
          onClose?.();
        },
      },
    );
  }

  if (isPending) return <Spinner />;

  return (
    <Form type={"regular"}>
      <FormRow label="État" error={errors.state?.message}>
        <Radios
          id="state"
          onChange={stateField.onChange}
          defaultValue={watchFields[0]}
          required={true}
        >
          {Object.entries(PRODUCT_STATES)
            .filter(([key]) => key !== "TO_INVESTIGATE")
            .map(([key, o]) => (
              <Radios.RadioButton
                key={key}
                value={key}
                color={o.color}
                disabled={isPending || !hasAccess(o.role)}
              >
                {o.label}
              </Radios.RadioButton>
            ))}
          <SeparatedState>
            <Radios.RadioButton
              value="TO_INVESTIGATE"
              color={PRODUCT_STATES.TO_INVESTIGATE.color}
              disabled={
                isPending || !hasAccess(PRODUCT_STATES.TO_INVESTIGATE.role)
              }
            >
              {PRODUCT_STATES.TO_INVESTIGATE.label}
            </Radios.RadioButton>
          </SeparatedState>
        </Radios>
      </FormRow>

      <FormRow label="Statut" error={errors.status?.message}>
        <Radios
          id="status"
          onChange={statusField.onChange}
          defaultValue={watchFields[1]}
          required={true}
        >
          {Object.entries(PRODUCT_STATUSES).map(([key, o]) => (
            <Radios.RadioButton
              key={key}
              value={key}
              color={o.color}
              disabled={isPending || (isStatusLocked && key !== "MAYBE_VEGAN")}
            >
              {o.label}
            </Radios.RadioButton>
          ))}
        </Radios>
      </FormRow>

      <FormRow label="Type" error={errors.product_type?.message}>
        <Radios
          id="product_type"
          onChange={productTypeField.onChange}
          defaultValue={watchFields[4]}
          required={true}
        >
          {Object.entries(PRODUCT_TYPES).map(([key, o]) => (
            <Radios.RadioButton
              key={key}
              value={key}
              color={o.color}
              disabled={isPending}
            >
              {o.label}
            </Radios.RadioButton>
          ))}
        </Radios>
      </FormRow>

      <FormRow label="Marque" error={errors.brand_id?.message}>
        <Select
          name="brand_id"
          onChange={brandField.onChange}
          getOptions={getSearchedBrand}
          defaultOptions={
            productToCheckedIn.brand
              ? [
                  {
                    value: productToCheckedIn.brand.id,
                    label: productToCheckedIn.brand.name,
                  },
                ]
              : []
          }
          defaultValue={[brandField.value]}
          disabled={isUpdating}
          isSearchable={true}
          isNullable={true}
          createComponent={
            <CreateBrandForm prefillName={productToCheckedIn.brandName} />
          }
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

      <FormRow label="Nom" error={errors.name?.message}>
        <Input
          type="text"
          id="name"
          {...register("name", {
            required:
              watchFields[1] !== "NOT_FOUND" ? "Le nom est obligatoire" : false,
          })}
          disabled={isPending}
        />
      </FormRow>

      <FormRow label="Description" error={errors.description?.message}>
        <Textarea
          id="description"
          {...register("description")}
          disabled={isPending}
        />
      </FormRow>

      {shouldShowProblemsField && (
        <FormRow
          label="Problèmes"
          hint="Raison pour laquelle le produit n'est pas vegan"
          error={errors.problem_description?.message}
        >
          <ProblemBox defaultValue={watchFields[2]} onChange={setValue}>
            <Textarea
              id="problem_description"
              {...register("problem_description", {
                required:
                  "Ce champ est obligatoire lorsque le status est 'MAYBE VEGAN' ou 'NON VEGAN'",
                validate: (value) =>
                  shouldShowProblemsField && !value ? false : true,
              })}
              disabled={isPending}
              required
            />
          </ProblemBox>
        </FormRow>
      )}

      <FormRow label="Biodynamie ?" error={errors.biodynamic?.message}>
        <Checkbox
          name="biodynamic"
          onChange={isByodinamicField.onChange}
          onBlur={isByodinamicField.onBlur}
          checked={isByodinamicField.value}
          value={isByodinamicField.value}
          $inputRef={isByodinamicField.ref}
          disabled={isPending}
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
          disabled={isPending}
        />
      </FormRow>

      <FormRow label="Image" error={errors.image?.message}>
        <ImageUploader
          id="image"
          onUpload={imageField.onChange}
          disabled={isPending}
          defaultValue={imageField.value}
          previewBaseUrl={S3_STORAGE_URL}
        />
      </FormRow>

      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onClose()}
          disabled={isPending}
        >
          Annuler
        </Button>
        {hasAccess("contributor") && (
          <Modal>
            <Modal.Open opens="delete">
              <Button $variation="danger" disabled={isPending} type="button">
                Supprimer
              </Button>
            </Modal.Open>
            <Modal.Window name="delete">
              <ConfirmAction
                variation="delete"
                title="Supprimer un produit"
                message="Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement ce produit ?"
                onConfirm={() =>
                  deleteProduct(checkedId, {
                    onSettled: () => onClose(),
                  })
                }
                disabled={isPending}
              />
            </Modal.Window>
          </Modal>
        )}
        <Button disabled={isPending} onClick={handleSubmit(onSubmit)}>
          Enregistrer
        </Button>
      </FormRow>
    </Form>
  );
}

export default RegisterProductForm;
