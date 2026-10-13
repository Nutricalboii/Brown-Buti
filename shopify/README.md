# Shopify size-chart snippet

`snippets/mnm-size-chart.liquid` contains the same size-chart modal used by the Mocha & Mogra website.

To publish it in the Shopify theme:

1. In Shopify Admin, open **Online Store → Themes → Edit code**.
2. Add a snippet named `mnm-size-chart` and paste in `snippets/mnm-size-chart.liquid`.
3. Create **Size** variants `XS`, `S`, `M`, `L`, `XL`, and `XXL` on the Chandi and Tamara products.
4. In the product form/template, render the snippet inside the product form for blouse products, for example:

```liquid
{% if product.type == 'Blouse' or product.tags contains 'blouse' %}
  {% render 'mnm-size-chart' %}
{% endif %}
```

The size radios use Shopify’s `options[Size]` field, so they must be rendered inside the product form to select the matching variant at add-to-cart.

The current repository only has a Storefront API token, and that token is unauthorized for the configured store. The snippet is therefore prepared locally but has not been published into Shopify Admin.
