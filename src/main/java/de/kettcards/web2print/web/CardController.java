package de.kettcards.web2print.web;


import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.service.CardService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return cardService.findCard(orderId);
    }

}
