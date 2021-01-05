package de.kettcards.web2print.model.tableimport.request;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Motive;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MotiveResponse {

    private String orderId;

    private Card.Side side;

    private String textureSlug;


}
