package de.kettcards.web2print.model;

import lombok.Data;

@Data
public class OrderFormData {
    private int    amount;
    private String fname;
    private String lname;
    private String email;
    private String address;
    private String region;
    private String postal;
    private String phone;
    private String company;
    private String additional;

    private boolean billing_differs;
    private String  b_fname;
    private String  b_lname;
    private String  b_address;
    private String  b_region;
    private String  b_postal;
    private String  b_phone;
    private String  b_company;

    //fields from kettcards
    private String nummer;
}
