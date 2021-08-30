package de.kettcards.web2print.web;


import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.service.CardService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

@CrossOrigin("*")
@RestController
@RequestMapping("${web2print.links.api-path}")
public final class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping({"/card", "/cards"})
    public Page<CardOverview> getCardOverview(@RequestParam(required = false) Integer page,
                                              @RequestParam(required = false) Integer size) {
        return cardService.listCardOverview(page, size);
    }

    @GetMapping("/card/{orderId}")
    public Card getCard(@PathVariable String orderId) {
        try {
            return cardService.findCard(orderId);
        } catch (HttpClientErrorException ignore) {
            //we don't need to spam the console only because a user fails to write the correct orderId in the url
            return null;
        }
    }

}
