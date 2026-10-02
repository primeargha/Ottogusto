interface ORDER_LABELS_Interface {
  [key: string]: string;
}

export const ORDER_LABELS: ORDER_LABELS_Interface = {
  Order_deliveredon: "Delivered on [date]",
  Order_refunded: "Refunded",
  Order_processing: "Processing",
  Order_partially_refunded: "Parially Refunded",
  Order_returned: "Returned",
  Order_returning: "Returning",
  Order_invoiced: "Invoiced",

  Order_detailed_view: "Detailed view: [content]",

  // Order_detailed_view: "Detailed View",
  Order_download_invoice: "Download Invoice",
  Order_paid_with: "Paid with [method]",
  Order_invoice_delay_msg: "Invoice is being generated. Please check back in a few minutes.",

  Modify_address: "Modify Address",
  Checkout_home_delivery: "Home delivery",
  Checkout_click_and_collect: "Click and Collect",
  Checkout_warehouse_pickup: "Warehouse Pickup",

  Checkout_streetname_required: "Street name is required",
  Checkout_housenumber_required: "House number is required",
  Checkout_city_required: "City is required",
  Checkout_postcode_required: "Postal code is required",

  Confirmcar_popup_info:
    "You can search for car parts without an account. Sign in to save cars to your garage and access additional features.",

  Productdetailed_saved_carlist: "Your Saved Cars",

  Edit_car_details: "Edit Car detail",
  Edit_car_savechanges: "Save Changes",
  request_information: "Request Information",
  on_request: "On Request",
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  backorder: "Backorder",
  delivery_type_small: "1–3 business days",
  delivery_type_medium: "4–7 business days",
  delivery_type_large: "8–14 business days",
  end_of_life: "End of Life",
};
