package de.kettcards.web2print.model;

import lombok.Data;

@Data
public class OrderFormData {
  private String fname;
  private String lname;
  private String email;
  private String address;
  private String region;
  private String postal;
  private String phone;
  private String company;
  private String additional;
}
