package api.app.astrodao.com.tests.proposals;

import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.api.proposals.ProposalResponse;
import api.app.astrodao.com.steps.ProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("proposalsAccountProposalsAccountIdApiTests")})
@Epic("Proposals")
@Feature("/proposals/account-proposals/{accountId} API tests")
@DisplayName("/proposals/account-proposals/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ProposalsAccountProposalsAccountIdApiTests extends BaseTest {
	private final ProposalsApiSteps proposalsApiSteps;

	@Value("${accounts.account1.accountId}")
	private String account1Id;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get account proposals by 'accountId' param")
	@DisplayName("User should be able to get account proposals by 'accountId' param")
	void getAccountProposalsByAccountIdParam() {
		int count = 50;

		ProposalResponse proposalResponse = proposalsApiSteps.getAccountProposalsByAccountId(account1Id).then()
				.statusCode(HTTP_OK)
				.extract().as(ProposalResponse.class);

		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), 6727, "total");
		proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), 1, "page");
		proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 134, "pageCount");
		proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), 50);

		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
		proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, count, "data/transactionHash");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
		proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
	}
}
