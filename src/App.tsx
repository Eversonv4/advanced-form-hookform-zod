import { useState } from "react";
import "./styles/global.css";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./lib/supabase";

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList).transform((list) => list.item(0)!),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .toLowerCase()
    .refine((email) => {
      return email.endsWith("@gmail.com");
    }, "O e-mail precisa ser do google"),
  password: z.string().min(6, "A senha precisa de nomínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos 2 tecnologias"),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function App() {
  const [output, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  async function createUser(data: CreateUserFormData) {
    await supabase.storage
      .from("nome_do_seu_bucket")
      .upload(data?.avatar?.name, data.avatar);

    setOutput(JSON.stringify(data, null, 2));
  }

  function addNewTech() {
    append({ title: "", knowledge: 0 });
  }

  return (
    <div className="h-screen bg-zinc-50 flex items-center justify-center flex-col">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input
            type="file"
            accept="image/*"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            style={{
              border: errors?.avatar?.message ? "2px solid red" : "",
              outline: errors?.avatar?.message ? "none" : "",
            }}
            {...register("avatar")}
          />
          {errors?.avatar?.message && (
            <p className="text-red-500">{errors?.avatar?.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            style={{
              border: errors?.name?.message ? "2px solid red" : "",
              outline: errors?.name?.message ? "none" : "",
            }}
            {...register("name")}
          />
          {errors?.name?.message && (
            <p className="text-red-500">{errors?.name?.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            style={{
              border: errors?.email?.message ? "2px solid red" : "",
              outline: errors?.email?.message ? "none" : "",
            }}
            {...register("email")}
          />
          {errors?.email?.message && (
            <p className="text-red-500">{errors?.email?.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            className="border border-zinc-200 shadow-sm rounded h-10 px-3"
            style={{
              border: errors?.password?.message ? "2px solid red" : "",
              outline: errors?.password?.message ? "none" : "",
            }}
            {...register("password")}
          />
          {errors?.password?.message && (
            <p className="text-red-500">{errors?.password?.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="" className="flex items-center justify-between">
            Tecnologias
            <button
              onClick={addNewTech}
              className="text-emerald-500 text-sm font-semibold"
            >
              Adicionar
            </button>
          </label>

          {fields.map((field, index) => {
            return (
              <div key={field.id} className="flex gap-2 mb-1">
                <div className="flex-1 flex-col gap-1">
                  <input
                    type="text"
                    className=" border border-zinc-800 shadow-sm rounded h-10 px-3"
                    {...register(`techs.${index}.title`)}
                  />

                  {errors?.techs?.[index]?.title && (
                    <p>{errors.techs?.[index]?.title?.message}</p>
                  )}
                </div>

                <div className="flex-1 flex-col gap-1">
                  <input
                    type="number"
                    className="w-16 border border-zinc-800 shadow-sm rounded h-10 px-3"
                    {...register(`techs.${index}.knowledge`)}
                  />

                  {errors?.techs?.[index]?.knowledge && (
                    <p>{errors.techs?.[index]?.knowledge?.message}</p>
                  )}
                </div>
              </div>
            );
          })}

          {errors?.techs && (
            <p className="text-red-500">{errors?.techs?.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-emerald-500 rounded font-semibold text-white py-2"
        >
          Salvar
        </button>
      </form>

      <pre className="mt-5">{output}</pre>
    </div>
  );
}
