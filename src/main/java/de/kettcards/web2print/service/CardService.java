package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.CardFormat;
import de.kettcards.web2print.model.projectons.CardOverview;
import de.kettcards.web2print.repository.CardFormatRepository;
import de.kettcards.web2print.repository.CardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
public final class CardService {

    private final CardRepository cardRepository;

    private final CardFormatRepository cardFormatRepository;

    public CardService(CardRepository cardRepository, CardFormatRepository cardFormatRepository) {
        this.cardRepository = cardRepository;
        this.cardFormatRepository = cardFormatRepository;
    }

    public Card findCard(@NonNull String orderId) {
        return cardRepository.findCardByOrderId(orderId).orElseThrow(() ->
                new HttpClientErrorException(HttpStatus.NOT_FOUND, "Karte " + orderId + " kann nicht gefunden werden"));
    }

    public CardFormat findCardFormat(@NonNull String orderId) {
        return findCard(orderId).getCardFormat();
    }

    public Page<CardOverview> listCardOverview(@Nullable Integer page,
                                               @Nullable Integer size) {
        if (page == null && size == null)
            return cardRepository.findAllProjectedBy(PageRequest.of(0, Integer.MAX_VALUE), CardOverview.class);
        if (page != null && size != null) {
            return cardRepository.findAllProjectedBy(PageRequest.of(page, size), CardOverview.class);
        }
        throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "parameters 'page' and 'size' should be used together");
    }

    public List<CardFormat> listCardFormats() {
        return cardFormatRepository.findAll();
    }

    public CardFormat findCardFormat(@NonNull Integer id) {
        return cardFormatRepository.findById(id).orElseThrow(() ->
                new HttpClientErrorException(HttpStatus.NOT_FOUND, "Kartenformat mit ID " + id + " kann nicht gefunden werden."));
    }

    public void updateCardFormat(@NonNull CardFormat cardFormat) {
        cardFormatRepository.save(cardFormat);
    }

}
