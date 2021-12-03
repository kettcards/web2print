package de.kettcards.web2print.model;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class OrderRefer {

    /**
     * redirect url for sending
     */
    private String referUrl;
    /**
     * post params for order submit
     */
    private Map<String, String> attributes = new HashMap<>();

    public OrderRefer(String referUrl) {
        this.referUrl = referUrl;
    }
}
