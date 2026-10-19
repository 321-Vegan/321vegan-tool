import { useController, useForm } from "react-hook-form";
import { useCreateBrand } from "./useCreateBrand";
import { getBrandsForSelect } from "@/services/apiBrands";

import Button from "@/ui/Button";
import Form from "@/ui/Form";
import FormRow from "@/ui/FormRow";
import Input from "@/ui/Input";
import Select from "@/ui/Select";
import Textarea from "@/ui/Textarea";
import Checkbox from "@/ui/Checkbox";
import Spinner from "@/ui/Spinner";

function CreateBrandForm({ prefillName, onCloseModal, onCreateOption }) {
  const { isCreating, createBrand } = useCreateBrand();
  const { register, formState, handleSubmit, reset, control } = useForm({
    defaultValues: {
      parent_id: null,
      name: prefillName || null,
      boycott: false,
      email: null,
      background: null,
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
    defaultValue: false,
  });

  function onSubmit(data) {
    createBrand(data, {
      onSuccess: (data) => {
        reset();
        onCloseModal?.();
        onCreateOption?.({ value: data.id, label: data.name });
      },
    });
  }

  if (isCreating) return <Spinner />;

  return (
    <Form type={onCloseModal ? "modal" : "regular"}>
      <FormRow label="Maison mère" error={errors.parent_id?.message}>
        <Select
          name="parent_id"
          onChange={parentField.onChange}
          getOptions={getBrandsForSelect}
          disabled={isCreating}
          isSearchable={true}
          isNullable={true}
        />
      </FormRow>

      <FormRow label="Nom" error={errors.name?.message}>
        <Input
          type="text"
          id="name"
          {...register("name", { required: "Ce champ est obligatoire" })}
          disabled={isCreating}
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
          disabled={isCreating}
        />
      </FormRow>

      <FormRow
        label="Informations générales"
        error={errors.background?.message}
      >
        <Textarea
          id="background"
          {...register("background")}
          disabled={isCreating}
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
          disabled={isCreating}
        />
      </FormRow>

      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isCreating}
        >
          Annuler
        </Button>
        <Button disabled={isCreating} onClick={handleSubmit(onSubmit)}>
          Créer
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateBrandForm;
