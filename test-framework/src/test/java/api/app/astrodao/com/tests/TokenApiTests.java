package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.tokens.NFTTokensList;
import api.app.astrodao.com.core.dto.api.tokens.TokensList;
import api.app.astrodao.com.openapi.models.NFTTokenResponse;
import api.app.astrodao.com.openapi.models.Token;
import api.app.astrodao.com.openapi.models.TokenResponse;
import api.app.astrodao.com.steps.TokenApiSteps;
import com.github.javafaker.Faker;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Map;

@Tags({@Tag("all"), @Tag("tokenApiTests")})
@Feature("TOKEN API TESTS")
@DisplayName("TOKEN API TESTS")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class TokenApiTests extends BaseTest {
    private final TokenApiSteps tokenApiSteps;
    private final Faker faker;

    @Value("${test.dao}")
    private String testDao;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, limit, offset]")
    void getListOfTokensWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        TokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, TokenResponse.class);

        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), limit, "total");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getCount().intValue(), limit, "limit");
        tokenApiSteps.assertCollectionHasCorrectSize(tokenResponse.getData(), limit);
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getSymbol().isBlank(), "symbol");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, page]")
    void getListOfTokensWithSortPageParams() {
        //TODO: Need to clarify this case
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        TokensList tokensList = tokenApiSteps.getResponseDto(response, TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThan(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, fields]")
    void getListOfTokensWithSortFieldsParams() {
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,symbol"
        );
        ResponseEntity<String> response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        TokensList tokensList = tokenApiSteps.getResponseDto(response, TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThan(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
        //TODO: add verification that other fields are null
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, s]")
    void getListOfTokensWithSortAndSParams() {
        int decimals = 18;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"decimals\": %s}", decimals)
        );
        ResponseEntity<String> response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        TokensList tokensList = tokenApiSteps.getResponseDto(response, TokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThan(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getSymbol().isBlank(), "symbol");
        tokenApiSteps.assertCollectionElementsContainsOnly(tokensList, Token::getDecimals, BigDecimal.valueOf(decimals), "decimals");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to get tokens for request with invalid params")
    void userShouldNotBeAbleToGetTokensForRequestWithInvalidParams() {
        Map<String, Object> query = Map.of(
                "limit","-1"
        );
        String expectedResponse = "LIMIT must not be negative";

        ResponseEntity<String> response = tokenApiSteps.getTokens(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
        tokenApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of token for valid DAO")
    void getListOfTokensForValidDao() {
        ResponseEntity<String> response = tokenApiSteps.getTokensForDao(testDao);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        TokensList tokensList = tokenApiSteps.getResponseDto(response, TokensList.class);

        tokenApiSteps.assertCollectionHasCorrectSize(tokensList, 1);
        tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getId, "NEAR", "id");
        tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getSymbol, "NEAR", "symbol");
        tokenApiSteps.assertDtoValue(tokensList.get(0), Token::getDecimals, BigDecimal.valueOf(24), "decimals");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getPrice().isBlank(), "price");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getBalance().isBlank(), "balance");
    }

    @Test
    @Disabled("Getting INTERNAL_SERVER_ERROR instead of BAD_REQUEST")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of token for valid DAO")
    void getListOfTokensForInvalidDao() {
        ResponseEntity<String> response = tokenApiSteps.getTokensForDao("wqeqrrr.sputnikv2.testnet");

        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, limit, offset]")
    void getNFTsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), limit, "total");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getCount().intValue(), limit, "limit");
        tokenApiSteps.assertCollectionHasCorrectSize(tokenResponse.getData(), limit);
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getIcon().isBlank(), "contract/icon");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getMetadata().getTokenId().isBlank(), "metadata/tokenId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of NFTs with query param: [sort, page]")
    void getListOfNFTsWithSortPageParams() {
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), page, "page");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "total");
        tokenApiSteps.assertDtoValueGreaterThan(tokenResponse, r -> r.getTotal().intValue(), 20, "limit");
        tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getMetadata().getTokenId().isBlank(), "metadata/tokenId");
    }

    @Test
    @Disabled("Getting BAD_REQUEST on request, looks like a bug")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of NFTs with query param: [sort, fields]")
    void getListOfNFTsWithSortFieldsParams() {
        Map<String, Object> query = Map.of(
//                "sort","id,DESC",
                "fields", "id,ownerId"
        );
        ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NFTTokensList tokensList = tokenApiSteps.getResponseDto(response, NFTTokensList.class);

        tokenApiSteps.assertCollectionHasSizeGreaterThan(tokensList, 20);
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokensList, r -> !r.getTokenId().isBlank(), "ownerId");
        //TODO: add verification that other fields are null
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of tokens with query param: [sort, s]")
    void getListOfNFTsWithSortAndSParams() {
        String contractId = "space7.mintspace2.testnet";
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"contractId\": \"%s\"}", contractId)
        );
        ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NFTTokenResponse tokenResponse = tokenApiSteps.getResponseDto(response, NFTTokenResponse.class);

        tokenApiSteps.assertDtoValue(tokenResponse, r -> r.getPage().intValue(), 1, "page");
        tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getTotal().intValue(), 1, "total");
        tokenApiSteps.assertDtoValueGreaterThanOrEqualTo(tokenResponse, r -> r.getTotal().intValue(), 1, "limit");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getId().isBlank(), "id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getOwnerId().isBlank(), "ownerId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContractId().isBlank(), "contractId");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getId().isBlank(), "contract/id");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getContract().getSpec().isBlank(), "contract/spec");
        tokenApiSteps.assertCollectionElementsHasValue(tokenResponse.getData(), r -> !r.getMetadata().getTokenId().isBlank(), "metadata/tokenId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to get NFTs for request with invalid params")
    void userShouldNotBeAbleToGetNFTsForRequestWithInvalidParams() {
        Map<String, Object> query = Map.of(
                "limit","-1"
        );
        String expectedResponse = "LIMIT must not be negative";

        ResponseEntity<String> response = tokenApiSteps.getNFTs(query);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.BAD_REQUEST);
        tokenApiSteps.assertStringContainsValue(response.getBody(), expectedResponse);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting events for valid NFT ID ")
    void getEventsForValidNftID() {
        //TODO: Clarify how to get events for a NFT
        String nftID = "space7.mintspace2.testnet-4";

        ResponseEntity<String> response = tokenApiSteps.getEventsForNFT(nftID);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.OK);
        tokenApiSteps.assertStringContainsValue(response.getBody(), "[]");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting events for invalid NFT ID ")
    void getEventsForInvalidNftID() {
        String nftID = "space7.mintspace2.testnet-123";
        String errorMsg = String.format("NFT with id %s not found", nftID);

        ResponseEntity<String> response = tokenApiSteps.getEventsForNFT(nftID);
        tokenApiSteps.assertResponseStatusCode(response, HttpStatus.NOT_FOUND);
        tokenApiSteps.assertStringContainsValue(response.getBody(), errorMsg);
    }
}
