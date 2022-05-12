package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.cli.AddProposalResponse;
import api.app.astrodao.com.core.dto.cli.dao.*;
import api.app.astrodao.com.core.dto.cli.proposals.bounty.*;
import api.app.astrodao.com.core.dto.cli.proposals.config.ChangeConfigDto;
import api.app.astrodao.com.core.dto.cli.proposals.policy.ChangePolicyDto;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposal;
import api.app.astrodao.com.core.dto.cli.proposals.poll.PollProposalDto;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.Transfer;
import api.app.astrodao.com.core.dto.cli.proposals.transfer.TransferProposalDto;
import api.app.astrodao.com.core.dto.cli.vote.VoteDto;
import api.app.astrodao.com.openapi.models.Dao;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.steps.cli.NearCLISteps;
import api.app.astrodao.com.steps.ProposalsApiSteps;
import api.app.astrodao.com.openapi.models.Proposal.StatusEnum;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.List;

import static api.app.astrodao.com.core.utils.WaitUtils.getEpochMillis;
import static api.app.astrodao.com.core.utils.WaitUtils.getLocalDateTime;
import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Epic("Aggregation")
@Tags({@Tag("all"), @Tag("aggregationWithoutCallback")})
@Feature("Aggregation with time-out tests")
@DisplayName("Aggregation with time-out tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class AggregationWithoutCallbackTests extends BaseTest {
    private final Faker faker;
    private final NearCLISteps nearCLISteps;
    private final ProposalsApiSteps proposalsApiSteps;
    private final DaoApiSteps daoApiSteps;

    @Value("${test.accountId}")
    private String testAccountId;

    @Value("${test.dao1}")
    private String testDao;

    @Value("${test.aggregation.timeout}")
    private int aggregationTimeout;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created DAO via Sputnik v2 API")
    @DisplayName("User should be able to get newly created DAO via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedDaoViaSputnikV2Api() {
        float deposit = 6F;
        long gasValue = 300000000000000L;
        String daoDisplayName = String.format("Test DAO %s", getEpochMillis());
        String daoName = daoDisplayName.toLowerCase().replaceAll("\\s", "-");
        String daoId = String.format("%s.sputnikv2.testnet", daoName);
        String daoPurpose = faker.lorem().characters(20, 30);
        String bond = "100000000000000000000000";
        String period = "604800000000000";
        BigDecimal decimalPeriod = new BigDecimal(period);
        String gracePeriod = "86400000000000";

        Role<KindWithGroup> role = Role.<KindWithGroup>of()
                .setName("Council")
                .setKind(KindWithGroup.of(List.of(testAccountId)))
                .setPermissions(List.of("*:Finalize", "*:AddProposal", "*:VoteApprove", "*:VoteReject", "*:VoteRemove"))
                .setVotePolicy(VotePolicy.of());

        DefaultVotePolicy defaultVotePolicy = DefaultVotePolicy.of()
                .setWeightKind("RoleWeight")
                .setQuorum("0")
                .setThreshold(List.of(1, 2));

        Policy policy = Policy.of()
                .setRoles(List.of(role))
                .setDefaultVotePolicy(defaultVotePolicy)
                .setProposalBond(bond)
                .setProposalPeriod(period)
                .setBountyBond(bond)
                .setBountyForgivenessPeriod(period);

        Metadata metadata = Metadata.of().setFlag("c1vdoupozsy28WZc2tm5e")
                .setDisplayName(daoDisplayName).setLinks(List.of());
        Config config = Config.of(daoName, daoPurpose, metadata);

        DAOArgs daoArgs = DAOArgs.of()
                .setPurpose(daoPurpose)
                .setBond(bond)
                .setVotePeriod(period)
                .setGracePeriod(gracePeriod)
                .setPolicy(policy)
                .setConfig(config);

        NewDAODto newDaoDto = NewDAODto.of(daoName, daoArgs);
        nearCLISteps.createNewDao(newDaoDto, testAccountId, gasValue, deposit);

        Response response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> daoApiSteps.getDAOByID(daoId)
        );

        Dao daoDto = response.then()
                .statusCode(HTTP_OK)
                .extract().as( Dao.class);

        //daoApiSteps.assertDtoValue(daoDto, DAODto::getIsArchived, Boolean.FALSE, "isArchived");
        daoApiSteps.assertDtoValue(daoDto, Dao::getId, daoId, "id");
        //TODO: Ask a question or raise a bug, sometimes TransactionHash is not available after DAO creation
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getTransactionHash, cliResponse.getTransactionHash(), "transactionHash");
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getUpdateTransactionHash, cliResponse.getTransactionHash(), "updateTransactionHash");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getName(), daoName, "config/name");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getPurpose(), daoPurpose, "config/purpose");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getConfig().getMetadata(), config.getMetadata(), "config/metadata");
        //TODO: Add verification for amount
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getAmount, "5000071399234288200000000", "amount");
        //TODO: Ask a question or raise a bug, sometimes createdBy is not available after DAO creation
        //daoApiSteps.assertDtoValue(daoDto, DAODto::getCreatedBy, testAccountId, "createdBy");
        daoApiSteps.assertDtoValue(daoDto, Dao::getTotalSupply, "0", "totalSupply");
        daoApiSteps.assertDtoValue(daoDto, Dao::getNumberOfMembers, BigDecimal.valueOf(1), "numberOfMembers");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalBond(), bond, "policy/proposalBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyBond(), bond, "policy/bountyBond");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getBountyForgivenessPeriod(), decimalPeriod, "policy/bountyForgivenessPeriod");
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getProposalPeriod(), decimalPeriod, "policy/proposalPeriod");
        daoApiSteps.assertCollectionHasCorrectSize(daoDto.getPolicy().getRoles(), 1);
        daoApiSteps.assertCollectionsAreEqual(daoDto.getPolicy().getRoles().get(0).getPermissions(), role.getPermissions());
        daoApiSteps.assertDtoValue(daoDto, d -> d.getPolicy().getRoles().get(0).getName(), role.getName(), "policy/roles[1]/name");
    }

    @Test
    @Tag("debug")
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created poll proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created poll proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedPollProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        PollProposal pollProposal = PollProposal.of(String.format("Poll created with NEAR CLI %s", getEpochMillis()), "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, pollProposalDto, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, pollProposal.getDescription(), "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), pollProposal.getKind(), "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created transfer proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created transfer proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedTransferProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String receiverId = "roman-account.testnet";
        String amount = "2500000000000000000000000"; //2.5 NEAR
        String description = String.format("Donation via NEAR CLI %s", getEpochMillis());

        Transfer transfer = Transfer.of().setReceiverId(receiverId).setAmount(amount).setTokenId(EMPTY);
        TransferProposalDto transferProposal = TransferProposalDto.of(description, transfer);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, transferProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "Transfer", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created add bounty proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedAddBountyProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = "Google for YouTube trends in 2021 Q4" + getEpochMillis();
        String amount = "1500000000000000000000000"; //1.5 NEAR
        Bounty bounty = Bounty.of()
                .setDescription(description)
                .setToken(EMPTY)
                .setAmount(amount)
                .setMaxDeadline("259200000000000")
                .setTimes(3);
        Proposal proposal = Proposal.of()
                .setDescription(description)
                .setKind(Kind.of(AddBounty.of(bounty)));
        BountyProposalDto bountyProposal = BountyProposalDto.of(proposal);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, bountyProposal, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "AddBounty", "kind/vote");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (new name update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigNameUpdateProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing name for %s %s", testDao, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(testDao);
        Metadata decodedMetadata = Metadata.decodeMetadata(config.getMetadata());

        String newDisplayName = String.format("Updated name test DAO %s", getEpochMillis());
        Metadata updatedMetadata = Metadata.of()
                .setDisplayName(newDisplayName)
                .setFlag(decodedMetadata.getFlag())
                .setLinks(decodedMetadata.getLinks());
        Config newConfig = Config.of(config.getName(), config.getPurpose(), updatedMetadata);
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (new purpose update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config (new purpose update) proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigPurposeUpdateProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing purpose for %s %s", testDao, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(testDao);

        String newPurpose = String.format("New purpose %s", getEpochMillis());
        Config newConfig = Config.of(config.getName(), newPurpose, config.getMetadata());
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change config (links update) proposal via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change config (links update) proposal via Sputnik v2 API")
    void userShouldBeAbleToGetNewlyCreatedChangeConfigLinksUpdateProposalViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing name for %s %s", testDao, getEpochMillis());

        Config config = nearCLISteps.getDaoConfig(testDao);
        Metadata decodedMetadata = Metadata.decodeMetadata(config.getMetadata());

        Metadata updatedMetadata = Metadata.of()
                .setDisplayName(decodedMetadata.getDisplayName())
                .setFlag(decodedMetadata.getFlag())
                .setLinks(List.of(faker.internet().url(), faker.internet().url()));
        Config newConfig = Config.of(config.getName(), config.getPurpose(), updatedMetadata);
        ChangeConfigDto changeConfig = ChangeConfigDto.of(description, newConfig);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changeConfig, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangeConfig", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangeConfig", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getName(), newConfig.getName(), "kind/config/name");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getPurpose(), newConfig.getPurpose(), "kind/config/purpose");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getConfig().getMetadata(), newConfig.getMetadata(), "kind/config/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (proposal bound update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (proposal bound update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBoundUpdateViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new proposal bond) for %s %s", testDao, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(testDao);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setProposalBond("150000000000000000000000"); //0.15 NEAR

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (proposal period update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (proposal period update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBoundPeriodUpdateViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new proposal period) for %s %s", testDao, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(testDao);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setProposalPeriod("259200000000000"); //3 days

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (bounty bond update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (bounty bond update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalBountyBondUpdateViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new bounty bond) for %s %s", testDao, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(testDao);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setBountyBond("150000000000000000000000"); //0.15 NEAR

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get newly created change policy proposal (bounty forgiveness period update) via Sputnik v2 API")
    @DisplayName("User should be able to get newly created change policy proposal (bounty forgiveness period update) via Sputnik v2 API")
    void getNewlyCreatedChangePolicyProposalProposalBountyForgivenessPeriodUpdateViaSputnikV2Api() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Changing policy (new bounty forgiveness period update) for %s %s", testDao, getEpochMillis());

        Policy daoPolicy = nearCLISteps.getDaoPolicy(testDao);

        Policy newPolicy = Policy.copy(daoPolicy)
                .setBountyForgivenessPeriod("259200000000000"); //3 days

        ChangePolicyDto changePolicy = ChangePolicyDto.of(description, newPolicy);

        AddProposalResponse output = nearCLISteps.addProposal(testDao, changePolicy, testAccountId, gasValue, deposit);
        String proposalID = String.format("%s-%s", testDao, output.getId());

        ProposalDto proposalDto = nearCLISteps.waitForAggregation(
                        aggregationTimeout,() -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getTransactionHash, output.getTransactionHash(), "transactionHash");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getProposer, testAccountId, "proposer");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDaoId, testDao, "daoId");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getDescription, description, "description");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getType, "ChangePolicy", "type");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.INPROGRESS, "status");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getType(), "ChangePolicy", "kind/type");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalBond(), newPolicy.getProposalBond(), "kind/policy/proposal_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getProposalPeriod(), newPolicy.getProposalPeriod(), "kind/policy/proposal_period");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyBond(), newPolicy.getBountyBond(), "kind/policy/bounty_bond");
        proposalsApiSteps.assertDtoValue(proposalDto, p -> p.getKind().getPolicy().getBountyForgivenessPeriod(), newPolicy.getBountyForgivenessPeriod(), "kind/policy/bounty_forgiveness_period");
    }

    @ParameterizedTest
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able vote to approve and reject proposals")
    @DisplayName("User should be able vote to approve and reject proposals")
    @Description("Create proposals and vote 'VoteApprove', 'VoteReject'")
    @CsvSource({"approve proposal, VoteApprove, Approved",
                "fail proposal, VoteReject, Rejected"})
    void userShouldBeAbleToVoteForProposal(String purpose, String voteAction, String status) {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;
        String description = String.format("Autotest - vote to %s. Poll created with NEAR CLI %s",
                purpose, getLocalDateTime());
        PollProposal pollProposal = PollProposal.of(description, "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse addProposalNearCliResponse = nearCLISteps.addProposal(
                testDao, pollProposalDto, testAccountId, gasValue, deposit);

        Integer proposalIndexId = addProposalNearCliResponse.getId();
        String proposalID = String.format("%s-%s", testDao, proposalIndexId);

        nearCLISteps.waitForAggregation(
                        aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)).then()
                .statusCode(HTTP_OK);

        VoteDto voteDto = VoteDto.of(proposalIndexId, voteAction);
        nearCLISteps.voteForProposal(testDao, voteDto, testAccountId, gasValue);

        nearCLISteps.waitForAggregation(aggregationTimeout);

        ProposalDto proposalDto = proposalsApiSteps.getProposalByID(proposalID).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getId, proposalID, "id");
        proposalsApiSteps.assertDtoValue(proposalDto, ProposalDto::getStatus, StatusEnum.fromValue(status), "status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able vote to remove proposal")
    @DisplayName("User should be able vote to remove proposal")
    @Description("User should be able to create proposal and vote 'VoteRemove' for it")
    void userShouldBeAbleToVoteToApproveProposal() {
        long gasValue = 100000000000000L;
        float deposit = 0.1F;

        PollProposal pollProposal = PollProposal.of(
                String.format("Autotest - vote to remove proposal. Poll created with NEAR CLI %s",
                        getLocalDateTime()), "Vote");
        PollProposalDto pollProposalDto = PollProposalDto.of(pollProposal);

        AddProposalResponse addProposalNearCliResponse = nearCLISteps.addProposal(
                testDao, pollProposalDto, testAccountId, gasValue, deposit);

        Integer proposalIndexId = addProposalNearCliResponse.getId();
        String proposalID = String.format("%s-%s", testDao, proposalIndexId);

        Response response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID)
        );
        proposalsApiSteps.assertResponseStatusCode(response, HTTP_OK);

        VoteDto voteDto = VoteDto.of(proposalIndexId, "VoteRemove");
        nearCLISteps.voteForProposal(testDao, voteDto, testAccountId, gasValue);

        response = nearCLISteps.waitForAggregation(
                aggregationTimeout, () -> proposalsApiSteps.getProposalByID(proposalID), HTTP_BAD_REQUEST
        );
        proposalsApiSteps.assertResponseStatusCode(response, HTTP_BAD_REQUEST);
    }
}
