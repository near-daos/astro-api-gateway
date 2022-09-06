package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsIdCloseApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{id}/close API tests")
@DisplayName("draft-proposals/{id}/close API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsIdCloseApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${accounts.account1.token}")
	private String authToken;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;


	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for draft proposal close endpoint for already closed draft proposal")
	@DisplayName("Get HTTP 400 for draft proposal close endpoint for already closed draft proposal")
	void getHttp400ForDraftProposalCloseEndpointForAlreadyClosedDraftProposal() {
		String closedDraftId = "6304a2a116e4390008f6b855";
		draftProposalsApiSteps.closeDraftProposal(closedDraftId, authToken).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Draft proposal is closed"),
				      "error", equalTo("Bad Request"));
	}


}