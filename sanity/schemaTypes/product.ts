import { defineArrayMember, defineField, defineType } from "sanity"

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "details", title: "Details", type: "text", rows: 5 }),
    defineField({
      name: "price",
      title: "Base price",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare-at price",
      type: "number",
    }),
    defineField({ name: "currency", type: "string", initialValue: "USD" }),
    defineField({
      name: "images",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({
      name: "rating",
      type: "number",
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({ name: "reviewCount", type: "number" }),
    defineField({
      name: "options",
      title: "Options",
      description: "Selectable axes such as Size or Color.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "option",
          fields: [
            defineField({ name: "name", type: "string" }),
            defineField({
              name: "values",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
          ],
          preview: { select: { title: "name" } },
        }),
      ],
    }),
    defineField({
      name: "variants",
      title: "Variants",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "variant",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "price",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
            defineField({ name: "sku", type: "string" }),
            defineField({ name: "inventory", type: "number", initialValue: 0 }),
            defineField({
              name: "options",
              title: "Option values",
              description: "Maps each option name to its selected value.",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "optionValue",
                  fields: [
                    defineField({ name: "name", type: "string" }),
                    defineField({ name: "value", type: "string" }),
                  ],
                  preview: { select: { title: "name", subtitle: "value" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "title", subtitle: "sku" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category.title", media: "images.0" },
  },
})
