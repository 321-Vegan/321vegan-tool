import { useController, useForm } from "react-hook-form";

import { getBrandsForSelect } from "@/services/apiBrands";
import { useUpdateBrand } from "./useUpdateBrand";

import Button from "@/ui/Button";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Textarea from "@/ui/Textarea";
import Select from "@/ui/Select";
import Checkbox from "@/ui/Checkbox";
import Spinner from "@/ui/Spinner";

function UpdateBrandForm({ brandToUpdate, onCloseModal }) {
  const { id: updateId, ...updateValues } = brandToUpdate;
  const { isUpdating, updateBrand } = useUpdateBrand();
  const { register, formState, handleSubmit, reset, control } = useForm({
    defaultValues: {
      ...updateValues,
      parent_id: brandToUpdate.parent?.id || null,
    },
  });
  const { errors } = formState;

  const { field: parentField } = useController({
    name: "parent_id",
    control,
  });

  const { field: boycottField } = useController({
    name: "boycott",
    control,
    defaultValue: brandToUpdate.boycott,
  });

  function onSubmit(data) {
    updateBrand(
      { newData: data, id: updateId },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  }

  if (isUpdating) return <Spinner />;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow label="Maison mère" error={errors.parent_id?.message}>
        <Select
          name="parent_id"
          onChange={parentField.onChange}
          getOptions={getBrandsForSelect}
          defaultValue={[parentField.value]}
          defaultOptions={
            brandToUpdate.parent
              ? [
                  {
                    value: brandToUpdate.parent.id,
                    label: brandToUpdate.parent.name,
                  },
                ]
              : []
          }
          disabled={isUpdating}
          isSearchable={true}
          isNullable={true}
        />
      </FormRow>

      <FormRow label="Nom" error={errors.name?.message} htmlFor="name">
        <Input
          type="text"
          id="name"
          {...register("name", { required: "Ce champ est obligatoire" })}
          disabled={isUpdating}
          required
        />
      </FormRow>

      <FormRow label="Adresse e-mail" error={errors.email?.message}>
        <Input
          type="email"
          id="email"
          {...register("email", {
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Adresse e-mail invalide",
            },
          })}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow
        label="Informations générales"
        error={errors.background?.message}
      >
        <Textarea
          id="background"
          {...register("background")}
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Boycott ?" error={errors.boycott?.message}>
        <Checkbox
          name="boycott"
          onChange={boycottField.onChange}
          onBlur={boycottField.onBlur}
          checked={boycottField.value}
          value={boycottField.value}
          $inputRef={boycottField.ref}
          disabled={isUpdating}
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
        <Button disabled={isUpdating}>Modifier</Button>
      </FormRow>
    </Form>
  );
}

export default UpdateBrandForm;
