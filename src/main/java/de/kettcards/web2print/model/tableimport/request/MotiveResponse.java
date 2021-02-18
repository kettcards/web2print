package de.kettcards.web2print.model.tableimport.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MotiveResponse {

    private String orderId;

    private String side;

    private String textureSlug;


}
